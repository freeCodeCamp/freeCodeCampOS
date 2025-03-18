use serde::{de::value::Error, Deserialize};

/// Extracts all bytes from the input string which can be deserialized into a `T`. Then, returns the non-deserialized parts of the string.
pub fn deserialize_and_extract<'de, T: Deserialize<'de>>(
    input: &'de str,
) -> Result<(Option<T>, &'de str), Error> {
    let mut deserialized = Option::None;
    let mut remaining = input;

    while !remaining.is_empty() {
        match serde_json::from_str::<T>(remaining) {
            Ok(value) => {
                deserialized = Some(value);
                remaining = &remaining[remaining.find('}').unwrap() + 1..];
            }
            Err(_) => break,
        }
    }

    Ok((deserialized, remaining))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_and_extract() {
        let input = r#"{"a": 1}{"b": 2}{"c": 3}"#;
        let (deserialized, remaining) =
            deserialize_and_extract::<serde_json::Value>(input).unwrap();

        assert_eq!(deserialized, Some(serde_json::json!({"a": 1})));
        assert_eq!(remaining, r#"{"b": 2}{"c": 3}"#);
    }
}
