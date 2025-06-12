import SectionTitle from "./SectionTitle";

interface Props {
  id: string;
  title: string;
  description: string;
  bgColor?: string;
}

const Section: React.FC<React.PropsWithChildren<Props>> = ({
  id,
  title,
  description,
  bgColor,
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <section id={id} className={`py-10 lg:py-20 ${bgColor}`}>
      <div className="mx-auto w-full px-5 md:px-20">
        <SectionTitle>
          <h2 className="mb-4 text-center">{title}</h2>
        </SectionTitle>
        <p className="mb-12 text-center">{description}</p>
        {children}
      </div>
    </section>
  );
};

export default Section;
