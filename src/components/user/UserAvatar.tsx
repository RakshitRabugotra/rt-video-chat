import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TapBounce from "@/components/ui/motion/tap-bounce";
// Type definitions
import { SocketUser, TapEventHandler } from "@/types";

const UserAvatar: React.FC<
  SocketUser & {
    onTap: TapEventHandler;
  }
> = ({ userId, profile, onTap }) => {
  return (
    <TapBounce onTap={onTap}>
      <Avatar key={userId} className="size-44 no-select">
        <AvatarImage src={profile.imageUrl} className="no-select" />
        <AvatarFallback className="no-select">
          {profile.username}
        </AvatarFallback>
      </Avatar>
    </TapBounce>
  );
};

export default UserAvatar;
