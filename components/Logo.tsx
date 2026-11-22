import Image from "next/image";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "h-32 w-32"
      : "h-14 w-14 sm:h-[76px] sm:w-[76px]";
  return (
    <Image
      src="/logo.png"
      alt="Nicki Hairport"
      width={size === "lg" ? 128 : 76}
      height={size === "lg" ? 128 : 76}
      priority={size === "md"}
      sizes={size === "lg" ? "128px" : "(min-width:640px) 76px, 56px"}
      className={`${cls} rounded-full shadow-[0_0_24px_-6px_rgba(212,160,23,.6)]`}
    />
  );
}
