import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TapBounce from "@/components/ui/motion/tap-bounce";
import { cn } from "@/lib/utils";
// Type definitions
import { SocketUser, TapEventHandler } from "@/types";

const UserAvatar: React.FC<{
  socketUser: SocketUser;
  disableAnimation?: boolean;
  onTap?: TapEventHandler;
  classNames?: {
    animDiv?: string
    avatar?: {
      base?: string,
      image?: string,
      fallback?: string
    }
  }
}> = ({ socketUser, disableAnimation = false, classNames, onTap }) => {
  return (
    <TapBounce onTap={onTap} disableAnimation={disableAnimation} className={classNames?.animDiv}>
      <Avatar key={socketUser.userId} className={cn("size-44 no-select", classNames?.avatar?.base)}>
        <AvatarImage src={socketUser.profile.imageUrl} className={cn("no-select", classNames?.avatar?.image)} />
        <AvatarFallback className={cn("no-select", classNames?.avatar?.fallback)}>
          {socketUser.profile.username}
        </AvatarFallback>
      </Avatar>
    </TapBounce>
  );
};

export default UserAvatar;
