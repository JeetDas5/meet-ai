// Allow CSS imports
declare module "*.css";
declare module "stream-chat-react/dist/css/*" {
  const content: string;
  export default content;
}
declare module "@stream-io/video-react-sdk/dist/css/*" {
  const content: string;
  export default content;
}
