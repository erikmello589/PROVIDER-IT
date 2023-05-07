export function StringToDate(dataStr) //recebe 'DD/MM/AAAA' e retorna 'MM-DD-AAAA'
{
    var dateParts = dataStr.split("/");
    var dateObject = `${dateParts[1]}-${dateParts[0]}-${dateParts[2]}`;
    return dateObject;
}

export function DateToString(dateObject) {
    try {
        let date, month, year;

        date = dateObject.getDate();
        month = dateObject.getMonth() + 1;
        year = dateObject.getFullYear();

        date = date
            .toString()
            .padStart(2, '0');

        month = month
            .toString()
            .padStart(2, '0');

        return `${date}/${month}/${year}`;
    } catch (error) {
        return '';
    }
}
