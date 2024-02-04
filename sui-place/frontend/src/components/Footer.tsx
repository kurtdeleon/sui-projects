import { TiSocialTwitter } from "react-icons/ti";
import { AiFillGithub } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="rounded-md w-full flex text-xs items-center">
      <span className="opacity-40">Made by @watercrypt0</span>
      <span className="ml-auto flex items-center gap-[2px]">
        <a
          href="https://twitter.com/watercrypt0"
          className="flex opacity-40 hover:opacity-70"
        >
          <TiSocialTwitter size={18} />
        </a>
        <a
          href="https://github.com/watercrypto/sui-projects/tree/main/sui-place"
          className="flex opacity-40 hover:opacity-70"
        >
          <AiFillGithub size={14} />
        </a>
      </span>
    </footer>
  );
}
