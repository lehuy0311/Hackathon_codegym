

class Header extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <header>
        <table class="table">
            <tr>
            <th scope="col" class="ranknum">#</th>
            <th scope="col">
                Name of doctor
            </th>
            <th scope="col">Star</th>
            <th scope="col">Name of rank</th>
            </tr>
        <tbody class="table-body">
            <tr class="first-row">
            <th scope="row">
                <i class="fa-solid fa-medal fa-xl" style="color: rgb(227, 219, 0); "></i>
                1
            </th>
            <td >
                <img class="avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCO5640zzIWNfxqqoQQjwoyvt5-CRgX_U3tg&usqp=CAU" alt="Nani">
                Mark
            </td>
            <td>4.1</td>
            <td>Bác sĩ hoàng đế</td>
            </tr>
            <tr class="second-row">
            <th scope="row">
                <i class="fa-solid fa-medal fa-xl" style="color: rgb(182, 182, 182);"></i>
                2
            </th>
            <td >
                <img class="avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCO5640zzIWNfxqqoQQjwoyvt5-CRgX_U3tg&usqp=CAU" alt="Nani">
                Jacob
            </td>
            <td>3.6</td>
            <td>Người chỉ đứng hạng 2</td>
            </tr>
            <tr class="third-row">
            <th scope="row">
                <i class="fa-solid fa-medal fa-xl" style="color: rgb(229, 161, 15);"></i>
                3
            </th>
            <td>
                <img class="avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCO5640zzIWNfxqqoQQjwoyvt5-CRgX_U3tg&usqp=CAU" alt="Nani">
                Larry the Bird</td>
            <td>3.2</td>
            <td>hẠnG bA</td>
            </tr>
            <tr class="table-light">
                <th scope="row">         
                    4
                </th>
                <td>
                    <img class="avatar" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCO5640zzIWNfxqqoQQjwoyvt5-CRgX_U3tg&usqp=CAU" alt="Nani">
                    No name</td>
                <td>3.0</td>
                <td>người đứng ngoài rìa của cuộc chơi</td>
            </tr>
        </tbody>
        </table>
</header>
      `;
    }
  }
  
  customElements.define('table-component', Header);