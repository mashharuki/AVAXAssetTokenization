import LinkToPageButton from "../Button/LinkToPageButton";
import { MdAgriculture, MdList } from "react-icons/md";
import styles from "./HomeContainer.module.css";

/**
 * HomeContainer Component
 * @returns 
 */
export default function HomeContainer() {
    return (
        <div>
            <div className={styles.centerContent}>
                <LinkToPageButton
                    linkTo={"/FarmerPage"}
                    icon_left={<MdAgriculture size={50} />}
                    description={"For Farmer"}
                />
            </div>
            <div className={styles.centerContent}>
                <LinkToPageButton
                    linkTo={"/BuyerPage"}
                    icon_left={<MdList size={50} />}
                    description={"For Buyer"}
                />
            </div>
        </div>
    );
}