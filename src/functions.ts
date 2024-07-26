import pdfMake from 'pdfmake/build/pdfmake';
import pdfTimes from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { timesRegular, timesBold, timesItalic, timesBI } from './TimesFont';

export function convertStringToHour(now: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
    return now;
}

export function convertDateToString(date: Date) {
    const string = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return string;
}

export function displayedHour(time: string) {
    const [hours, minutes] = time.split(':');
    const result = minutes === "00" ? hours : `${hours}:${minutes}`
    return result;
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

pdfMake.vfs = pdfTimes.pdfMake.vfs;
window.pdfMake.vfs['times.ttf'] = timesRegular;
window.pdfMake.vfs['timesbd.ttf'] = timesBold;
window.pdfMake.vfs['timesi.ttf'] = timesItalic;
window.pdfMake.vfs['timesbi.ttf'] = timesBI;
pdfMake.fonts = {
    Times: {
        normal: 'times.ttf',
        bold: 'timesbd.ttf',
        italics: 'timesi.ttf',
        bolditalics: 'timesbi.ttf'
    }
}

export function generateHorario(date: string) {
    
}