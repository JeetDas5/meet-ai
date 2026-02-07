"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DialogContent, DialogDescription } from "@radix-ui/react-dialog";

interface ResponsiveDialogProps {
  title: string;
  description: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  title,
  description,
  children,
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} dismissible={true} shouldScaleBackground>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
