import { MeetingGetOne } from "../../types";
import { MeetingForm } from "./meeting-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface UpdateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog: React.FC<UpdateMeetingDialogProps> = ({
  open,
  onOpenChange,
  initialValues,
}) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Meeting"
      description="Edit the meeting details"
    >
      <MeetingForm
        onSuccess={(id) => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
