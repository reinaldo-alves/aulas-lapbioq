export function convertStringToHour(now: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
    return now;
}

export function fecharModal(selector: string) {
    const modal = document.querySelector(selector) as HTMLElement;
    if(modal){
        modal.style.display = 'none';
    }
}

export function abrirModal(e: React.MouseEvent<any>, selector: string){
    e.preventDefault();
    const modal = document.querySelector(selector) as HTMLElement;
    if(modal){
        modal.style.display = 'block';
    }
}