interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const progressPercentage = (current / total) * 100;

  return (
    <div className={`w-full bg-gray-300 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};
