# ViAgenda

Sistema de apoio à prospecção comercial pós-venda, desenvolvido para a **AGT Viagens** como Projeto Integrador — Sistema Web do curso de Engenharia de Software do **Centro Universitário SATC (UniSatc)**, sob orientação do professor **Hyan Dias Tavares**.

## 📋 Sobre o Projeto

A AGT Viagens enfrenta um problema recorrente: após a venda de um pacote de viagem, o acompanhamento comercial do cliente depende fortemente de controles manuais e da memória dos vendedores, o que faz com que oportunidades de recompra — como o contato após o retorno de uma viagem ou após a quitação do pagamento — acabem sendo perdidas.

O **ViAgenda** atua como uma camada de inteligência e lembrete entre os dados já existentes da agência (CRM e PaxPro) e a ação comercial do vendedor. O sistema **não substitui o CRM** nem toma decisões de venda sozinho: ele cruza os dados disponíveis, identifica clientes elegíveis à prospecção, explica o motivo de cada alerta e mantém o processo de acompanhamento vivo ao longo do tempo — a decisão final de abordagem permanece sempre com o vendedor.

Resumo do papel do sistema: **o ViAgenda encontra, explica, lembra e registra; o vendedor decide e conduz o atendimento.**

## 👥 Equipe

| Nome                            | Função                                         |
| ------------------------------- | ---------------------------------------------- |
| Thiago Bento Pacheco            | Levantamento de Requisitos e Regras de Negócio |
| Paulo Eduardo Alves de Oliveira | Banco de Dados                                 |
| Rafael Silvano Lopes            | Back-end                                       |
| Gabriel Fernandes Tomazi        | Front-end                                      |

## 🛠️ Tecnologias

**Front-end**

- Next.js
- React
- TypeScript
- Tailwind CSS

**Back-end**

- Java
- Spring Data JPA / Hibernate
- Swagger / Springdoc OpenAPI
- IntelliJ IDEA (IDE)

**Banco de Dados**

- PostgreSQL (relacional)
- pgAdmin4

## 🗂️ Modelagem de Dados

O banco de dados é relacional e contempla as entidades: `vendedor`, `cliente`, `destino`, `viagem`, `cliente_interesse`, `pagamento`, `parcela_pagamento` e `oportunidade`, com integridade referencial entre viagens, pagamentos, parcelas e oportunidades comerciais.

## 📌 Gestão do Projeto

- **Kanban (Jira):** https://projetointegradorweb.atlassian.net/jira/software/projects/PROJ/boards/1?filter=&groupBy=none
- **Documentação de infraestrutura:** ver relatório em PDF/DOCX entregue junto à disciplina.

## 📄 Documentação de Regras de Negócio

As regras de negócio do sistema foram validadas em entrevista com a AGT Viagens e cobrem, entre outros pontos: identificação de clientes elegíveis à prospecção, ausência de priorização rígida entre clientes, prospecção recorrente, contextualização da oportunidade para o vendedor, busca por destino, agendamento de novos contatos e registro do resultado de cada abordagem.

## 🚧 Status

Projeto em desenvolvimento — fase de estruturação do banco de dados, das entidades de back-end e dos protótipos de tela do front-end.

