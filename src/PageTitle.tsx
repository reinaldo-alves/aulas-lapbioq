import { useEffect } from "react";

export function PageTitle({title}: {title: string}) {
    useEffect(() => {
        document.title = title + ' | LAPBIOQ - DBIOQ - UFPE';
    }, [title]);
    return null;
}