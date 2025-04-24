import Image from "next/image";
import FileUpload from "./components/FileUpload";
import Chat from "./components/Chat";
export default function Home() {
  return (
    <div className="flex min-h-screen w-screen">
      <section className="w-[30vw] flex justify-center items-center bg-gradient-to-bl from-white to-red-100">
        <FileUpload/>
      </section>
      <section className="w-[70vw] border-l-2 bg-gradient-to-br from-white to-red-50">
        <Chat/>
      </section>
   
    </div>
  );
}
