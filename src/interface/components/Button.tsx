import { IconArrowBackUp, IconPencil, IconPlus } from "@tabler/icons-react";
import { type VariantProps, cva, cx } from "class-variance-authority";
import { type AriaButtonProps } from "react-aria";
import { Button as ReactAriaButton } from "react-aria-components";

type Icon = "add" | "edit" | "return";

interface ButtonProps
    extends VariantProps<typeof buttonStyle>,
        Pick<AriaButtonProps, "aria-label" | "onPress"> {
    icon?: Icon;
    text?: string;
}

const Button = ({
    intent,
    size,
    icon,
    text,
    "aria-label": ariaLabel,
}: ButtonProps) => {
    const iconComponent = (() => {
        switch (icon) {
            case "add":
                return (
                    <IconPlus
                        stroke={2}
                        aria-disabled
                        className={iconStyle({ size })}
                    />
                );
            case "edit":
                return (
                    <IconPencil
                        stroke={2}
                        aria-disabled
                        className={iconStyle({ size })}
                    />
                );
            case "return":
                return (
                    <IconArrowBackUp
                        stroke={2}
                        aria-disabled
                        className={iconStyle({ size })}
                    />
                );
            default:
                return null;
        }
    })();

    return (
        <ReactAriaButton
            aria-label={ariaLabel}
            className={buttonStyle({ intent, size })}
        >
            {iconComponent}
            {text}
        </ReactAriaButton>
    );
};

const buttonStyle = cva(
    cx(
        "rounded-full flex items-center border-2 font-semibold",
        "shadow-outer-2 shadow-dark",
        "md:shadow-outer-3 md:shadow-dark",
        "lg:shadow-outer-4 lg:shadow-dark",
        "active:shadow-inner-2 active:shadow-dark",
        "focus-visible:outline",
        "data-[pressed]:shadow-inner-2 data-[pressed]:shadow-dark",
    ),
    {
        variants: {
            intent: {
                primary: cx(
                    "bg-primary-common text-light",
                    "hover:bg-primary-dark",
                    "active:bg-primary-dark",
                    "focus-visible:outline-primary-light/50",
                    "data-[pressed]:bg-primary-dark",
                    "*:stroke-light",
                ),
                secondary: cx(
                    "bg-secondary-common text-light",
                    "hover:bg-secondary-dark",
                    "active:bg-secondary-dark",
                    "focus-visible:outline-secondary-light/50",
                    "data-[pressed]:bg-secondary-dark",
                    "*:stroke-light",
                ),
                accent: cx(
                    "bg-accent-common text-dark",
                    "hover:bg-accent-dark",
                    "active:bg-accent-dark",
                    "focus-visible:outline-accent-light/50",
                    "data-[pressed]:bg-accent-dark",
                    "*:stroke-dark",
                ),
                danger: cx(
                    "bg-danger-common text-light",
                    "hover:bg-danger-dark",
                    "active:bg-danger-dark",
                    "focus-visible:outline-danger-light/50",
                    "data-[pressed]:bg-danger-dark",
                    "*:stroke-light",
                ),
                warning: cx(
                    "bg-warning-common text-dark",
                    "hover:bg-warning-dark",
                    "active:bg-warning-dark",
                    "focus-visible:outline-warning-light/50",
                    "data-[pressed]:bg-warning-dark",
                    "*:stroke-dark",
                ),
                success: cx(
                    "bg-success-common text-light",
                    "hover:bg-success-dark",
                    "active:bg-success-dark",
                    "focus-visible:outline-success-light/50",
                    "data-[pressed]:bg-success-dark",
                    "*:stroke-light",
                ),
                inactive: cx(
                    "bg-inactive-common text-light",
                    "hover:bg-inactive-dark",
                    "active:bg-inactive-dark",
                    "focus-visible:outline-inactive-light/50",
                    "data-[pressed]:bg-inactive-dark",
                    "*:stroke-light",
                ),
            },
            size: {
                small: cx("text-lg", "md:text-xl"),
                large: cx("py-1 text-2xl"),
            },
        },
        defaultVariants: {
            intent: "primary",
            size: "small",
        },
    },
);

const iconStyle = cva("", {
    variants: {
        size: {
            small: cx("size-5", "md:size-6"),
            large: cx("size-8"),
        },
    },
    defaultVariants: {
        size: "small",
    },
});

export default Button;
