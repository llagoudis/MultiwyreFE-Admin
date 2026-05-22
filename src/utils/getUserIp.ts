import axios from "axios";

interface IPResponse {
  data: {
    ip: string;
  };
}
export const getUserIp = async () => {
  const userIp = localStorage.getItem("userIp");
  if (userIp) return userIp;

  const ipify: IPResponse = await axios.get(
    "https://api.ipify.org/?format=json",
  );
  console.log("ipify: ", ipify);

  if (ipify.data.ip) {
    localStorage.setItem("userIp", ipify.data.ip);
    return ipify.data.ip;
  }

  return "";
};
