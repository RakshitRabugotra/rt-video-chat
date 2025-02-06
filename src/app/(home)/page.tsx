import CallNotification from "@/components/call/CallNotification";
import VideoCallView from "@/components/call/VideoCallView";
import OnlineUserList from "@/components/user/OnlineUserList";

export default function Home() {
  return (
    <main className="inline-flex h-full w-full">
      <div className="view flex-1 flex-center">
        <OnlineUserList />
        <CallNotification />
      </div>
      
      <VideoCallView />
    </main>
  );
}
