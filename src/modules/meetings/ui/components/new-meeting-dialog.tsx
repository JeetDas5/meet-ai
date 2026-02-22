import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { useRouter } from "next/navigation";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewMeetingDialog: React.FC<NewMeetingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Meeting"
      description="Create a new meeting"
    >
      <MeetingForm
        onSuccess={(id) => {
          onOpenChange(false);
          router.push(`/meetings/${id}`);
        }}
        onCancel={()=>onOpenChange}
      />
    </ResponsiveDialog>
  );
};
