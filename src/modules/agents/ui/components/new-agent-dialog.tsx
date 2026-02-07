import { AgentForm } from "./agent-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface NewAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewAgentDialog: React.FC<NewAgentDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Agent"
      description="Create a new agent"
    >
      <AgentForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};
