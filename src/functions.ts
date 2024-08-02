import pdfMake from 'pdfmake/build/pdfmake';
import pdfTimes from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { timesRegular, timesBold, timesItalic, timesBI } from './TimesFont';
import { IAula, IFeriado } from './types';

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

export function generateHorario(date: string, aulas: Array<IAula>, defaultFeriados: Array<string>, feriados: Array<IFeriado>) {
    const [year, month] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1);
    const formatter = new Intl.DateTimeFormat('pt-BR', {month: 'long', year: 'numeric'});
    const formattedDate = formatter.format(dateObj);
    const monthName = formattedDate.split(' ')[0];
    const firstWeekDay = dateObj.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const arrayData = Array.from({ length: 33 }, (_, i) => {
        const calcDay = firstWeekDay === 6 ? i + 3 : 2 - firstWeekDay + i;
        return {
            day: calcDay,
            header: calcDay > 0 && calcDay <= daysInMonth ? `Dia ${String(calcDay).padStart(2, '0')}` : '-',
            aulas: aulas.filter(aula => aula.info.data === `${date}-${String(calcDay).padStart(2, '0')}`)
        }
    });

    const generateBody = (item: {day: number, header: string, aulas: Array<IAula>}) => {
        const itemDate = `${date}-${String(item.day).padStart(2, '0')}`;
        if (defaultFeriados.includes(itemDate.slice(5)) || feriados.some(el => el.info.data === itemDate)) {
            return {text: 'FERIADO', fontSize: 24, fillColor: '#CCCCCC', alignment: 'center', bold: true, margin: [0, 20, 0, 0]}
        } else {
            return item.aulas.map(aula => (`${displayedHour(aula.info.inicio)}-${displayedHour(aula.info.termino)}: ${aula.info.nome} (${aula.info.curso.split('/')[0].toUpperCase()})`))
        }
    }
    
    const horarioTitle: Content = {
        text: [
            'HORÁRIO DE AULAS PRÁTICAS\n',
            `MÊS: ${monthName.toUpperCase()}          ANO: ${year}\n`
        ],
        fontSize: 12,
        alignment: 'center',
        bold: true, 
        margin: [0, 0, 0, 15]
    }

    const horarioTable: Content = {
        style: {
            fontSize: 10
        },
        table: {
            heights: ['auto', 'auto', 70, 'auto', 70, 'auto', 70, 'auto', 70, 'auto', 70],
            widths: ['*', '*', '*', '*', '*'],
            body: [
                [
                    {text: 'SEGUNDA', bold: true, alignment: 'center'},
                    {text: 'TERÇA', bold: true, alignment: 'center'},
                    {text: 'QUARTA', bold: true, alignment: 'center'},
                    {text: 'QUINTA', bold: true, alignment: 'center'},
                    {text: 'SEXTA', bold: true, alignment: 'center'}
                ],
                [
                    {text: arrayData[0].header, bold: true, alignment: 'center'},
                    {text: arrayData[1].header, bold: true, alignment: 'center'},
                    {text: arrayData[2].header, bold: true, alignment: 'center'},
                    {text: arrayData[3].header, bold: true, alignment: 'center'},
                    {text: arrayData[4].header, bold: true, alignment: 'center'}
                ],
                [
                    generateBody(arrayData[0]),
                    generateBody(arrayData[1]),
                    generateBody(arrayData[2]),
                    generateBody(arrayData[3]),
                    generateBody(arrayData[4])
                ],
                [
                    {text: arrayData[7].header, bold: true, alignment: 'center'},
                    {text: arrayData[8].header, bold: true, alignment: 'center'},
                    {text: arrayData[9].header, bold: true, alignment: 'center'},
                    {text: arrayData[10].header, bold: true, alignment: 'center'},
                    {text: arrayData[11].header, bold: true, alignment: 'center'}
                ],
                [
                    generateBody(arrayData[7]),
                    generateBody(arrayData[8]),
                    generateBody(arrayData[9]),
                    generateBody(arrayData[10]),
                    generateBody(arrayData[11])
                ],
                [
                    {text: arrayData[14].header, bold: true, alignment: 'center'},
                    {text: arrayData[15].header, bold: true, alignment: 'center'},
                    {text: arrayData[16].header, bold: true, alignment: 'center'},
                    {text: arrayData[17].header, bold: true, alignment: 'center'},
                    {text: arrayData[18].header, bold: true, alignment: 'center'}
                ],
                [
                    generateBody(arrayData[14]),
                    generateBody(arrayData[15]),
                    generateBody(arrayData[16]),
                    generateBody(arrayData[17]),
                    generateBody(arrayData[18])
                ],
                [
                    {text: arrayData[21].header, bold: true, alignment: 'center'},
                    {text: arrayData[22].header, bold: true, alignment: 'center'},
                    {text: arrayData[23].header, bold: true, alignment: 'center'},
                    {text: arrayData[24].header, bold: true, alignment: 'center'},
                    {text: arrayData[25].header, bold: true, alignment: 'center'}
                ],
                [
                    generateBody(arrayData[21]),
                    generateBody(arrayData[22]),
                    generateBody(arrayData[23]),
                    generateBody(arrayData[24]),
                    generateBody(arrayData[25])
                ],
                [
                    {text: arrayData[28].header, bold: true, alignment: 'center'},
                    {text: arrayData[29].header, bold: true, alignment: 'center'},
                    {text: arrayData[30].header, bold: true, alignment: 'center'},
                    {text: arrayData[31].header, bold: true, alignment: 'center'},
                    {text: arrayData[32].header, bold: true, alignment: 'center'}
                ],
                [
                    generateBody(arrayData[28]),
                    generateBody(arrayData[29]),
                    generateBody(arrayData[30]),
                    generateBody(arrayData[31]),
                    generateBody(arrayData[32])
                ]
            ]
        },
        layout: {
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex % 2 === 1 || rowIndex === 0) ? '#CCCCCC' : null;
            }
        }
    }

    const horarioDefinitions: TDocumentDefinitions = {
        info: {
            title: `Horario_${monthName}_${year}_Lapbioq`
        },
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [50, 40, 50, 40],
        content: [horarioTitle, horarioTable],
        defaultStyle: {
            font: 'Times'
        }
    }

    pdfMake.createPdf(horarioDefinitions).open({}, window.open(`Horario_${monthName}_${year}_Lapbioq.pdf`, '_blank'));
}