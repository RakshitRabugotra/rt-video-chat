import OnlineUserList from "@/components/OnlineUserList";
import VideoBox from "@/components/VideoBox";

export default function Home() {
  return (
    <div className="inline-flex h-full w-full">
      <OnlineUserList />
    </div>
  );
}

const VideoChatView = () => {
  return (
    <>
      <div className="view w-[65%]"></div>
      <aside className="video-view w-[35%] flex flex-col">
        <div className="video-view user border-x-2 border-solid border-red-600 flex-1">
          <VideoBox />
        </div>
        <div className="video-view other border-x-2 border-t-2 border-solid border-red-600 flex-1">
          <VideoBox />
        </div>
      </aside>
    </>
  );
};
