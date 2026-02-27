//! Curriculum markdown parser for freeCodeCampOS

use anyhow::{anyhow, Result};
use freecodecamp_config::{Lesson, Project, ProjectMeta, Test};
use regex::Regex;

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

                    if let Ok(lesson) = Self::parse_lesson(id, &lesson_lines.join("\n")) {
                        lessons.push(lesson);
                    }
                }
            }
        }

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
        let mut before_each = String::new();
        let mut after_each = String::new();
        let mut before_all = String::new();
        let mut after_all = String::new();

        let mut current_section = String::new();
        let mut current_code = String::new();
        let mut current_lang = String::new();
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
                    if current_section == "tests" && !current_code.is_empty() {
                        let runner = extract_runner(&current_lang);
                        tests.push(Test {
                            id: tests.len() as u32,
                            code: current_code.trim().to_string(),
                            runner,
                            state: Default::default(),
                        });
                    } else if current_section == "seed" && !current_code.is_empty() {
                        seed_content.push_str(&current_code);
                    } else if current_section == "before-each" && !current_code.is_empty() {
                        before_each.push_str(&current_code);
                    } else if current_section == "after-each" && !current_code.is_empty() {
                        after_each.push_str(&current_code);
                    } else if current_section == "before-all" && !current_code.is_empty() {
                        before_all.push_str(&current_code);
                    } else if current_section == "after-all" && !current_code.is_empty() {
                        after_all.push_str(&current_code);
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
            } else if current_section == "description" && !line.is_empty() {
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
            before_each: if before_each.is_empty() {
                None
            } else {
                Some(before_each)
            },
            after_each: if after_each.is_empty() {
                None
            } else {
                Some(after_each)
            },
            before_all: if before_all.is_empty() {
                None
            } else {
                Some(before_all)
            },
            after_all: if after_all.is_empty() {
                None
            } else {
                Some(after_all)
            },
        })
    }
}

fn extract_description(content: &str) -> Result<String> {
    let lines: Vec<&str> = content.lines().collect();
    let desc = lines
        .iter()
        .skip_while(|line| line.starts_with("#") || line.is_empty())
        .take_while(|line| !line.starts_with("```"))
        .map(|s| *s)
        .collect::<Vec<_>>()
        .join("\n");
    Ok(desc.trim().to_string())
}

fn extract_meta(content: &str) -> Result<ProjectMeta> {
    let json_re = Regex::new(r#"```json\s*([\s\S]*?)\s*```"#)?;
    
    if let Some(caps) = json_re.captures(content) {
        let json_str = &caps[1];
        Ok(serde_json::from_str(json_str)?)
    } else {
        // Return default meta if not found
        Ok(ProjectMeta {
            id: 0,
            is_integrated: false,
            is_public: true,
            run_tests_on_watch: true,
            seed_every_lesson: false,
            is_reset_enabled: true,
            number_of_lessons: None,
            blocking_tests: None,
            break_on_failure: None,
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
  "id": 0,
  "isIntegrated": false,
  "is_public": true,
  "runTestsOnWatch": true,
  "seedEveryLesson": false,
  "isResetEnabled": true,
  "numberofLessons": null,
  "blockingTests": null,
  "breakOnFailure": null
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
}
