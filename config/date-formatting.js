const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
module.exports = Date => {
    const year = Date.getFullYear();
    const month = months[Date.getMonth()];
    const date = Date.getDate().toString().length === 1 ? `0${Date.getDate()}` : Date.getDate();
    const day = days[Date.getDay()];
    const hour = Date.getHours().toString().length === 1 ? `0${Date.getHours()}` : Date.getHours();
    const minutes = Date.getMinutes().toString().length === 1 ? `0${Date.getMinutes()}` : Date.getMinutes();
    return `${day} ${date}/${month}/${year} ${hour}:${minutes}`;

}