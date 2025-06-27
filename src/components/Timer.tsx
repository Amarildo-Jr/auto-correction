import { useRouter } from "next/navigation";
import { useTimer } from "react-timer-hook";

function Timer({ expiryTimestamp }: { expiryTimestamp: Date }) {
  const router = useRouter();
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => router.push("/student/finish-exam"),
  });

  return (
    <div className="text-3xl font-mono">
      <span>{hours.toString().padStart(2, "0")}</span>:
      <span>{minutes.toString().padStart(2, "0")}</span>:
      <span>{seconds.toString().padStart(2, "0")}</span>
    </div>
  );
}

export { Timer };
