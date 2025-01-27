import CallNotification from "@/components/call/CallNotification";
import VideoCallView from "@/components/call/VideoCallView";
import OnlineUserList from "@/components/user/OnlineUserList";

export default function Home() {
  return (
    <main className="inline-flex h-full w-full">
      <div className="view w-[65%] flex-center">
        <OnlineUserList />
        <CallNotification />
      </div>
      <aside className="video-view w-[35%] flex flex-col">
        <VideoCallView />
      </aside>
    </main>
  );
}
