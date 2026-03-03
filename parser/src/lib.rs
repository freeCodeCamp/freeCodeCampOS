//! Curriculum markdown parser for freeCodeCampOS

use anyhow::{anyhow, Result};
use config::{Lesson, Project, ProjectMeta, Test};
use regex::Regex;
use uuid::Uuid;

pub struct CurriculumParser;

impl CurriculumParser {
    /// Parse a curriculum markdown file
    pub fn parse_project(markdown: &str) -> Result<Project> {
        let lines: Vec<&str> = markdown.lines().collect();
        
        // Extract title (first H1)
        let title = lines
            .iter()
            .find(|line| line.starts_with("# "))
            .map(|line| line[2..].trim())
            .ok_or(anyhow!("No title (H1) found in curriculum"))?
            .to_string();

        // Find first lesson marker (H2 with number)
        let first_lesson_idx = lines
            .iter()
            .position(|line| {
                if !line.starts_with("## ") {
                    return false;
                }
                let text = line[3..].trim();
                text.parse::<u32>().is_ok()
            })
            .ok_or(anyhow!("No lessons found"))?;

        // Extract meta and description from content before first lesson
        let preamble = lines[..first_lesson_idx].join("\n");
        let description = extract_description(&preamble)?;
        let meta = extract_meta(&preamble)?;

        // Parse lessons
        let mut lessons = Vec::new();

        for (i, line) in lines.iter().enumerate() {
            if line.starts_with("## ") {
                let text = line[3..].trim();
                if let Ok(id) = text.parse::<u32>() {
                    let lesson_lines = if i + 1 < lines.len() {
                        lines[i + 1..]
                            .iter()
                            .take_while(|l| !l.starts_with("## "))
                            .copied()
                            .collect::<Vec<_>>()
                    } else {
                        vec![]
                    };

                    lessons.push(Self::parse_lesson(id, &lesson_lines.join("\n"))?);
                }
            }
        }

        let mut meta = meta;
        meta.number_of_lessons = Some(lessons.len() as u32);

        Ok(Project {
            title,
            description,
            meta,
            lessons,
        })
    }

    /// Parse a single lesson
    fn parse_lesson(id: u32, content: &str) -> Result<Lesson> {
        let lines: Vec<&str> = content.lines().collect();
        
        let mut description = String::new();
        let mut tests = Vec::new();
        let mut seed_content = String::new();
        let mut hooks = config::Hooks::default();

        let mut current_section = String::new();
        let mut current_code = String::new();
        let mut current_lang = String::new();
        let mut current_test_text = String::new();
        let mut in_code_block = false;

        for line in lines {
            if line.starts_with("### --description--") {
                current_section = "description".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --tests--") {
                current_section = "tests".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --seed--") {
                current_section = "seed".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --before-each--") {
                current_section = "before-each".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --after-each--") {
                current_section = "after-each".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --before-all--") {
                current_section = "before-all".to_string();
                in_code_block = false;
                continue;
            }
            if line.starts_with("### --after-all--") {
                current_section = "after-all".to_string();
                in_code_block = false;
                continue;
            }

            // Handle code blocks
            if line.starts_with("```") {
                if in_code_block {
                    // End of code block
                    let runner = extract_runner(&current_lang);
                    if current_section == "tests" && !current_code.is_empty() {
                        tests.push(Test {
                            id: Uuid::new_v4(),
                            test_text: current_test_text.trim().to_string(),
                            code: current_code.trim().to_string(),
                            runner,
                            state: Default::default(),
                            feedback: None,
                        });
                        current_test_text.clear();
                    } else if current_section == "seed" && !current_code.is_empty() {
                        seed_content.push_str(&current_code);
                    } else if current_section == "before-each" && !current_code.is_empty() {
                        if hooks.before_each.is_some() {
                            return Err(anyhow!("Multiple before-each hooks found. Only one block is allowed."));
                        }
                        hooks.before_each = Some(config::Hook { runner, code: current_code.trim().to_string() });
                    } else if current_section == "after-each" && !current_code.is_empty() {
                        if hooks.after_each.is_some() {
                            return Err(anyhow!("Multiple after-each hooks found. Only one block is allowed."));
                        }
                        hooks.after_each = Some(config::Hook { runner, code: current_code.trim().to_string() });
                    } else if current_section == "before-all" && !current_code.is_empty() {
                        if hooks.before_all.is_some() {
                            return Err(anyhow!("Multiple before-all hooks found. Only one block is allowed."));
                        }
                        hooks.before_all = Some(config::Hook { runner, code: current_code.trim().to_string() });
                    } else if current_section == "after-all" && !current_code.is_empty() {
                        if hooks.after_all.is_some() {
                            return Err(anyhow!("Multiple after-all hooks found. Only one block is allowed."));
                        }
                        hooks.after_all = Some(config::Hook { runner, code: current_code.trim().to_string() });
                    }
                    in_code_block = false;
                    current_code.clear();
                    current_lang.clear();
                } else {
                    // Start of code block
                    in_code_block = true;
                    current_lang = line[3..].trim().to_string();
                }
            } else if in_code_block {
                current_code.push_str(line);
                current_code.push('\n');
            } else if current_section == "tests" {
                current_test_text.push_str(line);
                current_test_text.push('\n');
            } else if current_section == "description" {
                description.push_str(line);
                description.push('\n');
            }
        }

        Ok(Lesson {
            id,
            title: format!("Lesson {}", id),
            description: description.trim().to_string(),
            tests,
            seed: if seed_content.is_empty() {
                None
            } else {
                Some(seed_content)
            },
            hooks,
        })
    }
}

fn extract_description(content: &str) -> Result<String> {
    let mut in_code_block = false;
    let mut description_lines = Vec::new();

    for line in content.lines() {
        if line.starts_with("```") {
            in_code_block = !in_code_block;
            continue;
        }

        if in_code_block {
            continue;
        }

        if line.starts_with("# ") {
            continue;
        }

        description_lines.push(line);
    }

    Ok(description_lines.join("\n").trim().to_string())
}

fn extract_meta(content: &str) -> Result<ProjectMeta> {
    let json_re = Regex::new(r#"```json\s*([\s\S]*?)\s*```"#)?;
    
    if let Some(caps) = json_re.captures(content) {
        let json_str = &caps[1];
        Ok(serde_json::from_str(json_str)?)
    } else {
        // Return default meta if not found
        Ok(ProjectMeta {
            id: Uuid::nil(),
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
        })
    }
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

    #[test]
    fn test_parse_basic_curriculum() {
        let markdown = r#"# Learn Rust

```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "order": 0,
  "is_integrated": false,
  "is_public": true,
  "run_tests_on_watch": true,
  "seed_every_lesson": false,
  "is_reset_enabled": true
}
```

Learn Rust basics.

## 0

### --description--

Welcome!

### --tests--

```js,runner=node
assert(true);
```
"#;
        let result = CurriculumParser::parse_project(markdown);
        assert!(result.is_ok());
        let parsed = result.unwrap();
        assert_eq!(parsed.title, "Learn Rust");
        assert_eq!(parsed.lessons.len(), 1);
    }

    #[test]
    fn test_description_paragraphs() {
        let markdown = r#"# Project Title

```json
{
  "id": "b2c3d4e5-f6a1-4b5c-9d0e-1f2a3b4c5d6e",
  "order": 0,
  "is_integrated": false,
  "is_public": true,
  "run_tests_on_watch": true,
  "seed_every_lesson": false,
  "is_reset_enabled": true
}
```

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
        let project = CurriculumParser::parse_project(markdown).unwrap();
        
        assert!(project.description.contains("Project description paragraph one."), "Should contain project description paragraph one");
        assert!(project.description.contains("Project description paragraph two."), "Should contain project description paragraph two");
        assert!(project.description.contains("\n\n"), "Should preserve project description paragraph separation");
        
        let lesson = &project.lessons[0];
        assert!(lesson.description.contains("Lesson paragraph one."), "Should contain lesson paragraph one");
        assert!(lesson.description.contains("Lesson paragraph two."), "Should contain lesson paragraph two");
        assert!(lesson.description.contains("\n\n"), "Should preserve lesson description paragraph separation");
    }

    #[test]
    fn test_multiple_hooks_fail() {
        let markdown = r#"# Project

```json
{ "id": "b2c3d4e5-f6a1-4b5c-9d0e-1f2a3b4c5d6e", "order": 0 }
```

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
        let result = CurriculumParser::parse_project(markdown);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "Multiple before-all hooks found. Only one block is allowed.");
    }
}
