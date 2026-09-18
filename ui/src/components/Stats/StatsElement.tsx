import React from "react";

type StatsElementProps = React.HTMLAttributes<HTMLDivElement>;

export function StatsElement({ className, children, ...rest }: StatsElementProps) {
    return (
        <div className={["stats-element", className].filter(Boolean).join(" ")} {...rest}>
            {children}
        </div>
    );
}
