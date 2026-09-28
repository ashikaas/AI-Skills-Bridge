import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"],
  });
}
