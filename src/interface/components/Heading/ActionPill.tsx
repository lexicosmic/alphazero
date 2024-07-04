import { capitalizeFirstLetter } from "../../../formatting";
import type { PageAction } from "../../ui";
import Icon, { type IconSymbol } from "../Icon";
import Text from "../Text";

export interface ActionPillProps {
  pageAction: PageAction;
}

const ActionPill = ({ pageAction }: ActionPillProps) => {
  const symbol = ((): IconSymbol => {
    switch (pageAction) {
      case "add":
        return "Plus";
      case "edit":
        return "Pencil";
      case "view":
        return "Frame";
      default:
        return "ListSearch";
    }
  })();

  return (
    <div className="flex">
      <div className="flex border-r-2 border-dark bg-secondary-common">
        <Icon symbol={symbol} />
      </div>
      <div className="flex items-center px-1">
        <Text
          content={capitalizeFirstLetter(pageAction)}
          fontFamily="heading"
          size="small"
        />
      </div>
    </div>
  );
};

export default ActionPill;
