//! Curriculum markdown parser for freeCodeCampOS
#![allow(unused_assignments)]

use config::{Lesson, Project, ProjectMeta, Test};
use miette::{Diagnostic, NamedSource, Result, SourceSpan};
use comrak::{parse_document, Arena, Options, nodes::{AstNode, NodeValue}};
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Diagnostic, Debug)]
#[allow(unused_assignments)]
pub enum ParserError {
    #[error("No title (H1) found in curriculum")]
    #[diagnostic(code(parser::no_title), help("Ensure the markdown file starts with a '# Project Title'"))]
    NoTitle {
        #[source_code]
        src: NamedSource<String>,
        #[label("here")]
        span: SourceSpan,
    },

    #[error("No lessons found in curriculum")]
    #[diagnostic(code(parser::no_lessons), help("Lessons are defined by '## <number>' headings"))]
    NoLessons {
        #[source_code]
        src: NamedSource<String>,
    },

    #[error("Multiple {hook_type} hooks found. Only one block is allowed.")]
    #[diagnostic(
        code(parser::multiple_hooks),
        help("Try combining multiple code blocks into a single block for '{hook_type}'")
    )]
    MultipleHooks {
        hook_type: String,
        #[source_code]
        src: NamedSource<String>,
        #[label("first hook here")]
        first_span: SourceSpan,
        #[label("duplicate hook here")]
        duplicate_span: SourceSpan,
    },

    #[error("Failed to parse JSON")]
    #[diagnostic(code(parser::json_error))]
    JsonError {
        #[source]
        error: serde_json::Error,
        #[source_code]
        src: NamedSource<String>,
        #[label("in this block")]
        span: SourceSpan,
    },

    #[error("Invalid lesson ID: {id}")]
    #[diagnostic(code(parser::invalid_lesson_id), help("Lesson headings must be '## <number>'"))]
    InvalidLessonId {
        id: String,
        #[source_code]
        src: NamedSource<String>,
        #[label("here")]
        span: SourceSpan,
    },

    #[error("Failed to read curriculum file: {0}")]
    #[diagnostic(code(parser::io_error))]
    IoError(#[from] std::io::Error),
}

pub struct CurriculumParser;

impl CurriculumParser {
    /// Parse a curriculum markdown file from a path
    pub fn parse_project<P: AsRef<std::path::Path>>(path: P, meta: ProjectMeta) -> Result<Project> {
        let path = path.as_ref();
        let markdown = std::fs::read_to_string(path).map_err(ParserError::IoError)?;
        let file_name = path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("curriculum.md")
            .to_string();
        
        Self::parse_project_internal(&markdown, file_name, meta)
    }

    /// Parse a curriculum markdown string (useful for tests)
    pub fn parse_project_from_str(markdown: &str, meta: ProjectMeta) -> Result<Project> {
        Self::parse_project_internal(markdown, "memory.md".to_string(), meta)
    }

    fn parse_project_internal(markdown: &str, file_name: String, mut meta: ProjectMeta) -> Result<Project> {
        let arena = Arena::new();
        let mut options = Options::default();
        options.extension.shortcodes = true;
        
        let root = parse_document(&arena, markdown, &options);
        let src = NamedSource::new(file_name, markdown.to_string());

        let mut title = None;
        let mut description_nodes = Vec::new();
        let mut lessons = Vec::new();

        let mut first_lesson_found = false;

        for node in root.children() {
            let data = node.data.borrow();
            match &data.value {
                NodeValue::Heading(h) if h.level == 1 && title.is_none() => {
                    title = Some(node_to_text(node));
                }
                NodeValue::Heading(h) if h.level == 2 => {
                    let text = node_to_text(node);
                    if let Ok(id) = text.trim().parse::<u32>() {
                        first_lesson_found = true;
                        lessons.push(Self::parse_lesson(id, node, &src)?);
                    } else {
                        return Err(ParserError::InvalidLessonId {
                            id: text,
                            src: src.clone(),
                            span: source_pos_to_span(markdown, data.sourcepos),
                        }.into());
                    }
                }
                _ if !first_lesson_found => {
                    if title.is_some() {
                         description_nodes.push(node);
                    }
                }
                _ => {}
            }
        }

        let title = title.ok_or_else(|| ParserError::NoTitle {
            src: src.clone(),
            span: (0, 0).into(),
        })?;

        if lessons.is_empty() {
            return Err(ParserError::NoLessons { src }.into());
        }

        meta.number_of_lessons = Some(lessons.len() as u32);

        let description = description_nodes.iter()
            .map(|n| node_to_markdown(n))
            .collect::<Vec<_>>()
            .join("\n\n")
            .trim()
            .to_string();

        Ok(Project {
            title,
            description,
            meta,
            lessons,
        })
    }

    /// Parse a single lesson starting from its H2 heading node
    fn parse_lesson<'a>(id: u32, heading_node: &'a AstNode<'a>, src: &NamedSource<String>) -> Result<Lesson> {
        let markdown = src.inner();
        let mut description_nodes = Vec::new();
        let mut tests = Vec::new();
        let mut seed_raw = String::new();
        let mut hooks = config::Hooks::default();
        
        // Track spans for duplicate hook detection
        let mut hook_spans: std::collections::HashMap<String, SourceSpan> = std::collections::HashMap::new();

        let mut current_section = String::new();
        let mut current_test_text = String::new();

        // Iterate siblings until next H2
        let mut current = heading_node.next_sibling();
        while let Some(node) = current {
            let data = node.data.borrow();
            if let NodeValue::Heading(h) = &data.value {
                if h.level == 2 {
                    break;
                }
                if h.level == 3 {
                    current_section = node_to_text(node).trim().to_string();
                    current = node.next_sibling();
                    continue;
                }
            }

            match &data.value {
                NodeValue::CodeBlock(c) => {
                    let runner = extract_runner(&c.info);
                    let span = source_pos_to_span(markdown, data.sourcepos);

                    match current_section.as_str() {
                        "--tests--" => {
                            tests.push(Test {
                                id: Uuid::new_v4(),
                                test_text: current_test_text.trim().to_string(),
                                code: c.literal.trim().to_string(),
                                runner,
                                state: Default::default(),
                                error: None,
                            });
                            current_test_text.clear();
                        }
                        "--seed--" => {
                            seed_raw.push_str(&c.literal);
                        }
                        "--before-each--" => {
                            if let Some(first_span) = hook_spans.get("--before-each--") {
                                return Err(ParserError::MultipleHooks {
                                    hook_type: "before-each".to_string(),
                                    src: src.clone(),
                                    first_span: *first_span,
                                    duplicate_span: span,
                                }.into());
                            }
                            hooks.before_each = Some(config::Hook { runner, code: c.literal.trim().to_string() });
                            hook_spans.insert("--before-each--".to_string(), span);
                        }
                        "--after-each--" => {
                            if let Some(first_span) = hook_spans.get("--after-each--") {
                                return Err(ParserError::MultipleHooks {
                                    hook_type: "after-each".to_string(),
                                    src: src.clone(),
                                    first_span: *first_span,
                                    duplicate_span: span,
                                }.into());
                            }
                            hooks.after_each = Some(config::Hook { runner, code: c.literal.trim().to_string() });
                            hook_spans.insert("--after-each--".to_string(), span);
                        }
                        "--before-all--" => {
                            if let Some(first_span) = hook_spans.get("--before-all--") {
                                return Err(ParserError::MultipleHooks {
                                    hook_type: "before-all".to_string(),
                                    src: src.clone(),
                                    first_span: *first_span,
                                    duplicate_span: span,
                                }.into());
                            }
                            hooks.before_all = Some(config::Hook { runner, code: c.literal.trim().to_string() });
                            hook_spans.insert("--before-all--".to_string(), span);
                        }
                        "--after-all--" => {
                            if let Some(first_span) = hook_spans.get("--after-all--") {
                                return Err(ParserError::MultipleHooks {
                                    hook_type: "after-all".to_string(),
                                    src: src.clone(),
                                    first_span: *first_span,
                                    duplicate_span: span,
                                }.into());
                            }
                            hooks.after_all = Some(config::Hook { runner, code: c.literal.trim().to_string() });
                            hook_spans.insert("--after-all--".to_string(), span);
                        }
                        _ => {}
                    }
                }
                NodeValue::Paragraph if current_section == "--tests--" => {
                    current_test_text.push_str(&node_to_text(node));
                    current_test_text.push('\n');
                }
                _ if current_section == "--description--" || current_section.is_empty() => {
                    description_nodes.push(node);
                }
                _ => {}
            }

            current = node.next_sibling();
        }

        let description = description_nodes.iter()
            .map(|n| node_to_markdown(n))
            .collect::<Vec<_>>()
            .join("\n\n")
            .trim()
            .to_string();

        let seed = if seed_raw.is_empty() {
            None
        } else {
            let lines: Vec<&str> = seed_raw.lines().collect();
            let first_line = lines[0].trim();
            if first_line.starts_with("#### --") && first_line.ends_with("--") {
                let target = &first_line[7..first_line.len() - 2].trim();
                let code = lines[1..].join("\n");
                if *target == "cmd" {
                    let runner = tests.first().map(|t| t.runner.clone()).unwrap_or_else(|| "bash".to_string());
                    Some(config::Seed::Command { runner, code })
                } else {
                    Some(config::Seed::File { path: target.trim_matches('"').to_string(), code })
                }
            } else {
                Some(config::Seed::Command { runner: "bash".to_string(), code: seed_raw })
            }
        };

        Ok(Lesson {
            id,
            title: format!("Lesson {}", id),
            description,
            tests,
            seed,
            hooks,
        })
    }
}

fn node_to_text<'a>(node: &'a AstNode<'a>) -> String {
    let mut text = String::new();
    collect_text(node, &mut text);
    text
}

fn collect_text<'a>(node: &'a AstNode<'a>, out: &mut String) {
    match &node.data.borrow().value {
        NodeValue::Text(t) => out.push_str(t),
        NodeValue::Code(c) => out.push_str(&c.literal),
        NodeValue::CodeBlock(c) => out.push_str(&c.literal),
        _ => {
            for child in node.children() {
                collect_text(child, out);
            }
        }
    }
}

fn node_to_markdown<'a>(node: &'a AstNode<'a>) -> String {
    let mut buf = String::new();
    comrak::format_commonmark(node, &Options::default(), &mut buf).unwrap();
    buf
}

fn source_pos_to_span(markdown: &str, pos: comrak::nodes::Sourcepos) -> SourceSpan {
    let lines: Vec<&str> = markdown.lines().collect();
    
    let start_offset = lines.iter().take(pos.start.line - 1)
        .map(|l| l.len() + 1) // +1 for newline
        .sum::<usize>() + pos.start.column - 1;

    let end_offset = lines.iter().take(pos.end.line - 1)
        .map(|l| l.len() + 1)
        .sum::<usize>() + pos.end.column;

    (start_offset, end_offset - start_offset).into()
}

fn extract_runner(lang: &str) -> String {
    if lang.contains("runner=") {
        let parts: Vec<&str> = lang.split("runner=").collect();
        if parts.len() > 1 {
            return parts[1].split_whitespace().next().unwrap_or("bash").to_string();
        }
    }
    match lang.split(',').next().unwrap_or("") {
        "js" | "javascript" => "node".to_string(),
        "py" | "python" => "python".to_string(),
        "bash" | "sh" => "bash".to_string(),
        other => other.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_meta() -> ProjectMeta {
        ProjectMeta {
            id: Uuid::new_v4(),
            title: "Test Project".to_string(),
            dashed_name: "test-project".to_string(),
            order: 0,
            is_integrated: false,
            is_public: true,
            run_tests_on_watch: true,
            seed_every_lesson: false,
            is_reset_enabled: true,
            number_of_lessons: None,
            blocking_tests: None,
            break_on_failure: None,
            tags: vec![]
        }
    }

    #[test]
    fn test_parse_basic_curriculum() {
        let markdown = r#"# Learn Rust

Learn Rust basics.

## 0

### --description--

Welcome!

### --tests--

```js,runner=node
assert(true);
```
"#;
        let result = CurriculumParser::parse_project_from_str(markdown, create_test_meta());
        assert!(result.is_ok());
        let parsed = result.unwrap();
        assert_eq!(parsed.title, "Learn Rust");
        assert_eq!(parsed.lessons.len(), 1);
    }

    #[test]
    fn test_description_paragraphs() {
        let markdown = r#"# Project Title

Project description paragraph one.

Project description paragraph two.

## 1

### --description--

Lesson paragraph one.

Lesson paragraph two.

### --tests--

```js
assert(true);
```
"#;
        let project = CurriculumParser::parse_project_from_str(markdown, create_test_meta()).unwrap();
        
        assert!(project.description.contains("Project description paragraph one."), "Should contain project description paragraph one");
        assert!(project.description.contains("Project description paragraph two."), "Should contain project description paragraph two");
        
        let lesson = &project.lessons[0];
        assert!(lesson.description.contains("Lesson paragraph one."), "Should contain lesson paragraph one");
        assert!(lesson.description.contains("Lesson paragraph two."), "Should contain lesson paragraph two");
    }

    #[test]
    fn test_multiple_hooks_fail() {
        let markdown = r#"# Project

## 1
### --before-all--
```bash
echo "first"
```
```bash
echo "second"
```
### --tests--
```js
assert(true);
```
"#;
        let result = CurriculumParser::parse_project_from_str(markdown, create_test_meta());
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Multiple before-all hooks found. Only one block is allowed."));
    }
}
