import axios from "axios";



export async function generateVideoFromScript(payload: any) {

  const res = await axios.post("/api/generate-video", payload);

  return res.data.videoUrl;

}

