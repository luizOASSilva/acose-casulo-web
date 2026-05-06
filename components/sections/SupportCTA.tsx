import Button from '@/components/ui/Button';

interface SupportCTAProps {
  title: string;
  buttonText: string;
  buttonHref?: string;
  ariaLabel?: string;
}

export default function SupportCTA({
  title,
  buttonText,
  buttonHref = '/contato',
  ariaLabel,
}: SupportCTAProps) {
  return (
    <section
      aria-label={ariaLabel || title}
      className="border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
        <p className="text-gray-700 font-medium text- text-sm md:text-md max-w-xl text-center md:text-left">
          {title}
        </p>
        <Button
          href={buttonHref}
          text={buttonText}
          variant="primary"
          ariaLabel={ariaLabel || buttonText}
        />
      </div>
    </section>
  );
}
