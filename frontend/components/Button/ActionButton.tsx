import styles from "./ActionButton.module.css";

type Props = {
    title: string;
    onClick: () => void;
    disable: boolean;
};

/**
 * ActionButton Component
 * @param param0 
 * @returns 
 */
export default function ActionButton({ title, onClick, disable }: Props) {
    return (
        <button
            className={styles.button}
            onClick={onClick}
            disabled={disable}
        >
            {title}
        </button>
    );
}