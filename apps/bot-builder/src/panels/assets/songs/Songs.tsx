import { Modal } from "@mikugg/ui-kit";
import "./Songs.scss";
import { FaHammer } from "react-icons/fa6";

export default function Songs() {
  return (
    <>
      <div className="Characters group">
        <div className="title-small">Music</div>
        <div className="Characters__list">
          <div className="Characters__item"></div>
          <div className="Characters__item"></div>
          <div className="Characters__item">
            <FaHammer />
            Create
          </div>
          <div className="Characters__item">Search</div>
        </div>
      </div>
      <Modal opened={false} className="Characters__modal">
        <div className="title">Edit Character</div>
        <div>
          <button>Specification</button>
          <button>Outfits</button>
        </div>
      </Modal>
    </>
  );
}
