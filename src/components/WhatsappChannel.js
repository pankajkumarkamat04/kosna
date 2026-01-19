import IMAGES from "../img/image";
import "./WhatsappChannel.css";

const WhatsappChannel = () => {
  return (
    <div className="whatsappchannel">
      <div
        className="whatsapplink"
        onClick={() =>
          window.open("https://t.me/pankajkamat")
        }
      >
        <div className="image">
          <img src={IMAGES.telegram} alt="" />
        </div>
        <div className="msg">
          <p>Join our Telegram channel!</p>
          <h6>
            Stay updated for weekly pass giveaways, offers and updates! Join now
          </h6>
        </div>
      </div>
    </div>
  );
};

export default WhatsappChannel;
