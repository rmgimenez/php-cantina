# Sistema de controle de cantina escolar

O objetivo desse sistema é gerenciar de forma eficiente as operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

## Organização do Projeto

O projeto está organizado em duas partes principais: backend e frontend.

Durante o desenvolvimento, será importante manter uma comunicação clara entre as equipes de backend e frontend para garantir que as APIs atendam às necessidades da interface do usuário.

Terá que ser feito configuração de CORS no backend para permitir requisições do frontend durante o desenvolvimento.

Em produção, a configuração de CORS deve ser mais restritiva, permitindo apenas origens específicas.

Quando fizer o build do frontend, os arquivos estáticos gerados devem ser servidos pelo backend.

### Backend

O backend ficará na pasta `backend`, onde serão implementadas as APIs necessárias para o funcionamento do sistema.

Será usado a framework codeigniter 4.

### Frontend

O frontend ficará na pasta `frontend`, onde será implementada a interface do usuário do sistema.

Será utilizado vite com react para a construção da aplicação frontend.

Para gerenciar os pacotes será utilizado o gerenciador de pacotes pnpm.

Bibliotecas utilizadas:

- [react-router-dom](https://reactrouter.com/en/main) - Para roteamento da aplicação.
- [axios](https://axios-http.com/) - Para requisições HTTP.
- [zustand](https://github.com/pmndrs/zustand) - Para gerenciamento de estado.
- [react-query](https://react-query.tanstack.com/) - Para gerenciamento de dados assíncronos.
- [bootstrap](https://getbootstrap.com/) - Para estilização da aplicação.
- [react-icons](https://react-icons.github.io/react-icons/) - Para ícones no projeto.
