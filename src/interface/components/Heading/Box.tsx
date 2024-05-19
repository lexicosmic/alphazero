import clsx from "clsx/lite";
import type { PropsWithChildren } from "react";

interface BoxProps {
	id?: React.ComponentProps<"section">["id"];
	"aria-label"?: React.ComponentProps<"section">["aria-label"];
	className?: React.ComponentProps<"section">["className"];
}

export default function Box({
	children,
	id,
	"aria-label": ariaLabel,
	className,
}: PropsWithChildren<BoxProps>) {
	return (
		<section
			id={id}
			aria-label={ariaLabel}
			className={clsx(
				"rounded-full border-2 bg-light shadow-outer-2",
				"md:shadow-outer-4",
				className,
			)}
		>
			{children}
		</section>
	);
}
