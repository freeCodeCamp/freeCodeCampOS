interface DescriptionProps {
  description: string;
}

const Description = ({ description }: DescriptionProps) => {
  return (
    <>
      <h2>Description</h2>
      <section
        id="description"
        dangerouslySetInnerHTML={{ __html: description }}
      ></section>
    </>
  );
};

export default Description;
