import { AgentGetOne } from "../../types";
import { AgentForm } from "./agent-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface updateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: AgentGetOne;
}

export const UpdateAgentDialog: React.FC<updateAgentDialogProps> = ({
  open,
  onOpenChange,
  initialValues,
}) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Agent"
      description="Edit the agent details"
    >
      <AgentForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
