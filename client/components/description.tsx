import { parseMarkdown } from "../utils";

interface DescriptionProps {
  description: string;
}

export const Description = ({ description }: DescriptionProps) => {
  return (
    <section
      id='description'
      dangerouslySetInnerHTML={{ __html: parseMarkdown(description) }}
    ></section>
  );
};
