const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm;">
    <div className="bg-teal-100 rounded-lg p-2 w-fit">
      <Icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-500">{description}</p>
  </div>
);

export default FeatureCard;
