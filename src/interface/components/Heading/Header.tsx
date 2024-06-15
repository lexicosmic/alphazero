import clsx from "clsx/lite";
import { Element } from "../../ui";
import Button from "../Button";
import ActionPill, { type ActionPillProps } from "./ActionPill";
import Logotype from "./Logotype";
import Pill from "./Pill";
import Title from "./Title";

interface HeaderProps extends ActionPillProps {
	pageTitle: string;
}

export default function Header({ pageTitle, pageAction }: HeaderProps) {
	return (
		<header
			className={clsx(
				"flex h-14 items-center border-b-4 bg-primary-common",
				"md:border-b-6 md:h-16",
				"lg:h-[5.5rem] lg:border-b-8",
			)}
		>
			<div
				id="logotype"
				className={clsx(
					"hidden h-full",
					"sm:block sm:border-r-4",
					"md:border-r-6",
					"lg:border-r-8",
				)}
			>
				<Logotype />
			</div>
			<div
				id="header-contents"
				className={clsx(
					"flex grow items-end gap-2 pl-2",
					"sm:px-4",
					"md:gap-4 md:px-6",
				)}
			>
				<Pill id="header-page-name" aria-label="Page">
					<Title text={pageTitle} element={Element.h1} size="large" />
				</Pill>
				<Pill
					id="header-page-action"
					aria-label="Page action"
					className="flex items-center overflow-clip"
				>
					<ActionPill pageAction={pageAction} />
				</Pill>
			</div>
			<div className="flex h-full items-center pr-2">
				<Button icon="add" color="accent" aria-label="Add" />
			</div>
		</header>
	);
}
