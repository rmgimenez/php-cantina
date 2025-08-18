-- início - tabelas que já existem no banco de dados
CREATE TABLE `cadastro_alunos` (
  `ra` int NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `nome_social` varchar(255) DEFAULT NULL,
  `nacionalidade` smallint DEFAULT NULL,
  `natural_de` varchar(255) DEFAULT NULL,
  `reside` varchar(255) DEFAULT NULL,
  `nasc` datetime DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  `estcivil` varchar(255) DEFAULT NULL,
  `dt_cadastro` datetime DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `email2` varchar(255) DEFAULT NULL,
  `familia` double DEFAULT NULL,
  `cod_religião` smallint DEFAULT NULL,
  `cert_nasc` varchar(255) DEFAULT NULL,
  `rg` varchar(255) DEFAULT NULL,
  `rg_emissao` datetime DEFAULT NULL,
  `cpf` varchar(255) DEFAULT NULL,
  `t_eleitoral` varchar(255) DEFAULT NULL,
  `zon_sec` varchar(255) DEFAULT NULL,
  `reservista` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `reserv_emissao` datetime DEFAULT NULL,
  `reserv_orgemissor` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `residecom` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `tel_cel` varchar(255) DEFAULT NULL,
  `tel_res` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `fax` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `gr_sanguineo` char(255) DEFAULT NULL,
  `rh` char(255) DEFAULT NULL,
  `sarampo` int DEFAULT NULL,
  `catapora` int DEFAULT NULL,
  `coqueluche` int DEFAULT NULL,
  `caxumba` int DEFAULT NULL,
  `rubeola` int DEFAULT NULL,
  `dengue` int DEFAULT NULL,
  `h1n1` int DEFAULT NULL,
  `covid19` int DEFAULT NULL,
  `outras_doencas` int DEFAULT NULL,
  `esp_outras_doencas` varchar(255) DEFAULT NULL,
  `cardiovascular` int DEFAULT NULL,
  `neurologico` int DEFAULT NULL,
  `diabete` int DEFAULT NULL,
  `audicao` int DEFAULT NULL,
  `respiratorio` int DEFAULT NULL,
  `musculo_esqueletico` int DEFAULT NULL,
  `visao` int DEFAULT NULL,
  `outros_disturbios` int DEFAULT NULL,
  `esp_outros_disturbios` varchar(255) DEFAULT NULL,
  `medicacao` int DEFAULT NULL,
  `descricao_medicacao` varchar(255) DEFAULT NULL,
  `tratamento` int DEFAULT NULL,
  `descricao_tratamento` varchar(255) DEFAULT NULL,
  `anti_termico` varchar(255) DEFAULT NULL,
  `dosagem_anti_termico` varchar(255) DEFAULT NULL,
  `analgesico` varchar(255) DEFAULT NULL,
  `dosagem_analgesico` varchar(255) DEFAULT NULL,
  `cicatrizante` varchar(255) DEFAULT NULL,
  `dosagem_cicatrizante` varchar(255) DEFAULT NULL,
  `outra_medicacao` varchar(255) DEFAULT NULL,
  `dosagem_outra_medicacao` varchar(255) DEFAULT NULL,
  `cirurgia` int DEFAULT NULL,
  `descricao_cirurgia` varchar(255) DEFAULT NULL,
  `medico` varchar(255) DEFAULT NULL,
  `tel_medico` varchar(255) DEFAULT NULL,
  `dentista` varchar(255) DEFAULT NULL,
  `tel_dentista` varchar(255) DEFAULT NULL,
  `convenio` varchar(255) DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `obs_medicas` longtext,
  `alergia` int DEFAULT NULL,
  `descricao_alergia` varchar(255) DEFAULT NULL,
  `obs` longtext,
  `nome_resp` varchar(255) DEFAULT NULL,
  `rg_resp` varchar(255) DEFAULT NULL,
  `cpf_resp` varchar(255) DEFAULT NULL,
  `nasc_resp` datetime DEFAULT NULL,
  `endereco_resp` varchar(255) DEFAULT NULL,
  `bairro_resp` varchar(255) DEFAULT NULL,
  `tel_cel_resp` varchar(255) DEFAULT NULL,
  `tel_res_resp` varchar(255) DEFAULT NULL,
  `cidade_resp` varchar(255) DEFAULT NULL,
  `estado_resp` varchar(255) DEFAULT NULL,
  `cep_resp` varchar(255) DEFAULT NULL,
  `fax_resp` varchar(255) DEFAULT NULL,
  `email_resp` varchar(255) DEFAULT NULL,
  `email_resp2` varchar(255) DEFAULT NULL,
  `empresa_resp` varchar(255) DEFAULT NULL,
  `cod_prof_resp` smallint DEFAULT NULL,
  `tel_emp_resp` varchar(255) DEFAULT NULL,
  `nome_resp_fin` varchar(255) DEFAULT NULL,
  `tipo_resp_fin` varchar(4) DEFAULT NULL,
  `rg_resp_fin` varchar(255) DEFAULT NULL,
  `cpf_resp_fin` varchar(255) DEFAULT NULL,
  `cnpj_resp_fin` varchar(255) DEFAULT NULL,
  `nasc_resp_fin` datetime DEFAULT NULL,
  `endereco_resp_fin` varchar(255) DEFAULT NULL,
  `bairro_resp_fin` varchar(255) DEFAULT NULL,
  `tel_cel_resp_fin` varchar(255) DEFAULT NULL,
  `tel_res_resp_fin` varchar(255) DEFAULT NULL,
  `cidade_resp_fin` varchar(255) DEFAULT NULL,
  `estado_resp_fin` varchar(255) DEFAULT NULL,
  `cep_resp_fin` varchar(255) DEFAULT NULL,
  `fax_resp_fin` varchar(255) DEFAULT NULL,
  `email_resp_fin` varchar(255) DEFAULT NULL,
  `email_resp_fin2` varchar(255) DEFAULT NULL,
  `empresa_resp_fin` varchar(255) DEFAULT NULL,
  `cod_prof_resp_fin` smallint DEFAULT NULL,
  `tel_emp_resp_fin` varchar(255) DEFAULT NULL,
  `cod_respfinanc` char(255) DEFAULT NULL,
  `cod_resp` char(255) DEFAULT NULL,
  `endrespfin` int DEFAULT NULL,
  `telrespfin` int DEFAULT NULL,
  `endresp` int DEFAULT NULL,
  `teltresp` int DEFAULT NULL,
  `nro_chamada` smallint DEFAULT NULL,
  `curso_nome` varchar(255) DEFAULT NULL,
  `curso` int DEFAULT NULL,
  `serie` smallint DEFAULT NULL,
  `turma` varchar(255) DEFAULT NULL,
  `dt_matricula` datetime DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `situacao_bib` smallint DEFAULT NULL,
  `obs_bib` longtext,
  `ult_emprestimo` varchar(255) DEFAULT NULL,
  `data_ult_emprestimo` datetime DEFAULT NULL,
  `rematriculado` int DEFAULT NULL,
  `obs_fin` varchar(255) DEFAULT NULL,
  `pesquisa` varchar(255) DEFAULT NULL,
  `tesouraria` int DEFAULT NULL,
  `periodo` varchar(255) DEFAULT NULL,
  `ano_letivo` int DEFAULT NULL,
  `coordenacao` int DEFAULT NULL,
  `obs_coo` varchar(255) DEFAULT NULL,
  `escola_destino` varchar(255) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `codigo_tipo_motivo` int DEFAULT NULL,
  `dia_transferencia` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `grade` smallint DEFAULT NULL,
  `plano_pagamento` int DEFAULT NULL,
  `faz_tratamento_homeopatia` int DEFAULT NULL,
  `faz_tratamento_alopatia` int DEFAULT NULL,
  `teve_problema_ao_nascer` int DEFAULT NULL,
  `teve_problema_ao_nascer_qual` varchar(255) DEFAULT NULL,
  `convulsao_com_febre` int DEFAULT NULL,
  `convulsao_sem_febre` int DEFAULT NULL,
  `neurologista` int DEFAULT NULL,
  `neurologista_quando` varchar(255) DEFAULT NULL,
  `neurologista_porque` varchar(255) DEFAULT NULL,
  `tratamento_foniatrico` int DEFAULT NULL,
  `tratamento_foniatrico_porque` varchar(255) DEFAULT NULL,
  `tratamento_fisioterapico` int DEFAULT NULL,
  `tratamento_fisioterapico_porque` varchar(255) DEFAULT NULL,
  `escola_anterior` varchar(255) DEFAULT NULL,  
  `foi_retido` int DEFAULT NULL,
  `foi_retido_motivo` varchar(255) DEFAULT NULL,
  `existe_local_para_estudo` int DEFAULT NULL,
  `existe_horario_para_estudo` int DEFAULT NULL,
  `ha_acompanhamento_estudos` int DEFAULT NULL,
  `ha_acompanhamento_estudos_quem` varchar(255) DEFAULT NULL,  
  `meio_transporte_chegada_escola` varchar(255) DEFAULT NULL,
  `meio_transporte_saida_escola` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno1` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno2` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno3` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno4` varchar(255) DEFAULT NULL,
  `autorizado_deixar_colegio_sozinho` int DEFAULT NULL,
  `quem_fica_aluno_ausencia_pais` varchar(255) DEFAULT NULL,
  `relacionamento_mae` varchar(255) DEFAULT NULL,
  `relacionamento_pai` varchar(255) DEFAULT NULL,
  `reserva` int DEFAULT NULL,
  `concomitante` int DEFAULT NULL,
  `cor_raca` varchar(255) DEFAULT NULL,
  `programa_bilingue` int DEFAULT NULL,
  `curriculum_americano` int DEFAULT NULL,
  `nao_divulgar_imagem` int DEFAULT NULL,
  `prodesp` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `santanna_mais` int DEFAULT NULL,
  `importado` int DEFAULT NULL,
  `assist_medica_emergencia` tinyint DEFAULT NULL,
  `obs_portaria` longtext,
  `necessidade_educ_especial` tinyint DEFAULT '0',
  `possui_laudo` tinyint DEFAULT '0',
  PRIMARY KEY (`ra`),
  KEY `idx_cadastro_alunos_ra` (`ra`),
  KEY `idx_cadastro_alunos_nome` (`nome`),
  KEY `idx_cadastro_alunos_cpf_resp` (`cpf_resp`),
  KEY `idx_cadastro_alunos_cpf_resp_fin` (`cpf_resp_fin`),
  KEY `idx_cadastro_alunos_familia` (`familia`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` 
SQL SECURITY DEFINER VIEW `alunos` AS 
select `a`.`ra` AS `ra`,`a`.`nome` AS `nome`,`a`.`nome_social` AS `nome_social`,`a`.`nacionalidade` AS `nacionalidade`,`a`.`natural_de` AS `natural_de`,`a`.`reside` AS `reside`,`a`.`nasc` AS `nasc`,`a`.`sexo` AS `sexo`,`a`.`estcivil` AS `estcivil`,`a`.`dt_cadastro` AS `dt_cadastro`,`a`.`email` AS `email`,`a`.`email2` AS `email2`,`a`.`familia` AS `familia`,`a`.`cod_religião` AS `cod_religião`,`a`.`cert_nasc` AS `cert_nasc`,`a`.`rg` AS `rg`,`a`.`rg_emissao` AS `rg_emissao`,`a`.`cpf` AS `cpf`,`a`.`t_eleitoral` AS `t_eleitoral`,`a`.`zon_sec` AS `zon_sec`,`a`.`reservista` AS `reservista`,`a`.`categoria` AS `categoria`,`a`.`reserv_emissao` AS `reserv_emissao`,`a`.`reserv_orgemissor` AS `reserv_orgemissor`,`a`.`tipo` AS `tipo`,`a`.`residecom` AS `residecom`,`a`.`endereco` AS `endereco`,`a`.`bairro` AS `bairro`,`a`.`tel_cel` AS `tel_cel`,`a`.`tel_res` AS `tel_res`,`a`.`cidade` AS `cidade`,`a`.`estado` AS `estado`,`a`.`cep` AS `cep`,`a`.`fax` AS `fax`,`a`.`foto` AS `foto`,`a`.`gr_sanguineo` AS `gr_sanguineo`,`a`.`rh` AS `rh`,`a`.`sarampo` AS `sarampo`,`a`.`catapora` AS `catapora`,`a`.`coqueluche` AS `coqueluche`,`a`.`caxumba` AS `caxumba`,`a`.`rubeola` AS `rubeola`,`a`.`dengue` AS `dengue`,`a`.`h1n1` AS `h1n1`,`a`.`covid19` AS `covid19`,`a`.`outras_doencas` AS `outras_doencas`,`a`.`esp_outras_doencas` AS `esp_outras_doencas`,`a`.`cardiovascular` AS `cardiovascular`,`a`.`neurologico` AS `neurologico`,`a`.`diabete` AS `diabete`,`a`.`audicao` AS `audicao`,`a`.`respiratorio` AS `respiratorio`,`a`.`musculo_esqueletico` AS `musculo_esqueletico`,`a`.`visao` AS `visao`,`a`.`outros_disturbios` AS `outros_disturbios`,`a`.`esp_outros_disturbios` AS `esp_outros_disturbios`,`a`.`medicacao` AS `medicacao`,`a`.`descricao_medicacao` AS `descricao_medicacao`,`a`.`tratamento` AS `tratamento`,`a`.`descricao_tratamento` AS `descricao_tratamento`,`a`.`anti_termico` AS `anti_termico`,`a`.`dosagem_anti_termico` AS `dosagem_anti_termico`,`a`.`analgesico` AS `analgesico`,`a`.`dosagem_analgesico` AS `dosagem_analgesico`,`a`.`cicatrizante` AS `cicatrizante`,`a`.`dosagem_cicatrizante` AS `dosagem_cicatrizante`,`a`.`outra_medicacao` AS `outra_medicacao`,`a`.`dosagem_outra_medicacao` AS `dosagem_outra_medicacao`,`a`.`cirurgia` AS `cirurgia`,`a`.`descricao_cirurgia` AS `descricao_cirurgia`,`a`.`medico` AS `medico`,`a`.`tel_medico` AS `tel_medico`,`a`.`dentista` AS `dentista`,`a`.`tel_dentista` AS `tel_dentista`,`a`.`convenio` AS `convenio`,`a`.`hospital` AS `hospital`,`a`.`obs_medicas` AS `obs_medicas`,`a`.`alergia` AS `alergia`,`a`.`descricao_alergia` AS `descricao_alergia`,`a`.`obs` AS `obs`,`a`.`nome_resp` AS `nome_resp`,`a`.`rg_resp` AS `rg_resp`,`a`.`cpf_resp` AS `cpf_resp`,`a`.`nasc_resp` AS `nasc_resp`,`a`.`endereco_resp` AS `endereco_resp`,`a`.`bairro_resp` AS `bairro_resp`,`a`.`tel_cel_resp` AS `tel_cel_resp`,`a`.`tel_res_resp` AS `tel_res_resp`,`a`.`cidade_resp` AS `cidade_resp`,`a`.`estado_resp` AS `estado_resp`,`a`.`cep_resp` AS `cep_resp`,`a`.`fax_resp` AS `fax_resp`,`a`.`email_resp` AS `email_resp`,`a`.`email_resp2` AS `email_resp2`,`a`.`empresa_resp` AS `empresa_resp`,`a`.`cod_prof_resp` AS `cod_prof_resp`,`a`.`tel_emp_resp` AS `tel_emp_resp`,`a`.`nome_resp_fin` AS `nome_resp_fin`,`a`.`tipo_resp_fin` AS `tipo_resp_fin`,`a`.`rg_resp_fin` AS `rg_resp_fin`,`a`.`cpf_resp_fin` AS `cpf_resp_fin`,`a`.`cnpj_resp_fin` AS `cnpj_resp_fin`,`a`.`nasc_resp_fin` AS `nasc_resp_fin`,`a`.`endereco_resp_fin` AS `endereco_resp_fin`,`a`.`bairro_resp_fin` AS `bairro_resp_fin`,`a`.`tel_cel_resp_fin` AS `tel_cel_resp_fin`,`a`.`tel_res_resp_fin` AS `tel_res_resp_fin`,`a`.`cidade_resp_fin` AS `cidade_resp_fin`,`a`.`estado_resp_fin` AS `estado_resp_fin`,`a`.`cep_resp_fin` AS `cep_resp_fin`,`a`.`fax_resp_fin` AS `fax_resp_fin`,`a`.`email_resp_fin` AS `email_resp_fin`,`a`.`email_resp_fin2` AS `email_resp_fin2`,`a`.`empresa_resp_fin` AS `empresa_resp_fin`,`a`.`cod_prof_resp_fin` AS `cod_prof_resp_fin`,`a`.`tel_emp_resp_fin` AS `tel_emp_resp_fin`,`a`.`cod_respfinanc` AS `cod_respfinanc`,`a`.`cod_resp` AS `cod_resp`,`a`.`endrespfin` AS `endrespfin`,`a`.`telrespfin` AS `telrespfin`,`a`.`endresp` AS `endresp`,`a`.`teltresp` AS `teltresp`,`m`.`nro_chamada` AS `nro_chamada`,`c`.`nome` AS `curso_nome`,`m`.`curso` AS `curso`,`m`.`serie` AS `serie`,`m`.`turma` AS `turma`,`m`.`data_matricula` AS `dt_matricula`,`m`.`status` AS `status`,`a`.`situacao_bib` AS `situacao_bib`,`a`.`obs_bib` AS `obs_bib`,`a`.`ult_emprestimo` AS `ult_emprestimo`,`a`.`data_ult_emprestimo` AS `data_ult_emprestimo`,`a`.`rematriculado` AS `rematriculado`,`a`.`obs_fin` AS `obs_fin`,`a`.`pesquisa` AS `pesquisa`,`a`.`tesouraria` AS `tesouraria`,`m`.`periodo` AS `periodo`,`m`.`ano_letivo` AS `ano_letivo`,`a`.`coordenacao` AS `coordenacao`,`a`.`obs_coo` AS `obs_coo`,`a`.`escola_destino` AS `escola_destino`,`a`.`motivo` AS `motivo`,`a`.`codigo_tipo_motivo` AS `codigo_tipo_motivo`,`m`.`data_saida` AS `dia_transferencia`,`a`.`senha` AS `senha`,`a`.`grade` AS `grade`,`a`.`plano_pagamento` AS `plano_pagamento`,`a`.`faz_tratamento_homeopatia` AS `faz_tratamento_homeopatia`,`a`.`faz_tratamento_alopatia` AS `faz_tratamento_alopatia`,`a`.`teve_problema_ao_nascer` AS `teve_problema_ao_nascer`,`a`.`teve_problema_ao_nascer_qual` AS `teve_problema_ao_nascer_qual`,`a`.`convulsao_com_febre` AS `convulsao_com_febre`,`a`.`convulsao_sem_febre` AS `convulsao_sem_febre`,`a`.`neurologista` AS `neurologista`,`a`.`neurologista_quando` AS `neurologista_quando`,`a`.`neurologista_porque` AS `neurologista_porque`,`a`.`tratamento_foniatrico` AS `tratamento_foniatrico`,`a`.`tratamento_foniatrico_porque` AS `tratamento_foniatrico_porque`,`a`.`tratamento_fisioterapico` AS `tratamento_fisioterapico`,`a`.`tratamento_fisioterapico_porque` AS `tratamento_fisioterapico_porque`,`a`.`escola_anterior` AS `escola_anterior`,`a`.`escola_frequetou_cidade1` AS `escola_frequetou_cidade1`,`a`.`escola_frequetou_serie1` AS `escola_frequetou_serie1`,`a`.`escola_frequetou_ano1` AS `escola_frequetou_ano1`,`a`.`escola_frequetou_nome2` AS `escola_frequetou_nome2`,`a`.`escola_frequetou_cidade2` AS `escola_frequetou_cidade2`,`a`.`escola_frequetou_serie2` AS `escola_frequetou_serie2`,`a`.`escola_frequetou_ano2` AS `escola_frequetou_ano2`,`a`.`escola_frequetou_nome3` AS `escola_frequetou_nome3`,`a`.`escola_frequetou_cidade3` AS `escola_frequetou_cidade3`,`a`.`escola_frequetou_serie3` AS `escola_frequetou_serie3`,`a`.`escola_frequetou_ano3` AS `escola_frequetou_ano3`,`a`.`escola_frequetou_nome4` AS `escola_frequetou_nome4`,`a`.`escola_frequetou_cidade4` AS `escola_frequetou_cidade4`,`a`.`escola_frequetou_serie4` AS `escola_frequetou_serie4`,`a`.`escola_frequetou_ano4` AS `escola_frequetou_ano4`,`a`.`motivo_escolha_escola` AS `motivo_escolha_escola`,`a`.`foi_retido` AS `foi_retido`,`a`.`foi_retido_motivo` AS `foi_retido_motivo`,`a`.`existe_local_para_estudo` AS `existe_local_para_estudo`,`a`.`existe_horario_para_estudo` AS `existe_horario_para_estudo`,`a`.`ha_acompanhamento_estudos` AS `ha_acompanhamento_estudos`,`a`.`ha_acompanhamento_estudos_quem` AS `ha_acompanhamento_estudos_quem`,`a`.`participa_atividade_esportiva` AS `participa_atividade_esportiva`,`a`.`participa_atividade_esportiva_onde` AS `participa_atividade_esportiva_onde`,`a`.`participa_atividade_religiosa` AS `participa_atividade_religiosa`,`a`.`participa_atividade_religiosa_onde` AS `participa_atividade_religiosa_onde`,`a`.`participa_atividade_recreativa` AS `participa_atividade_recreativa`,`a`.`participa_atividade_recreativa_onde` AS `participa_atividade_recreativa_onde`,`a`.`participa_aula_informatica` AS `participa_aula_informatica`,`a`.`participa_aula_informatica_onde` AS `participa_aula_informatica_onde`,`a`.`participa_aula_linguas` AS `participa_aula_linguas`,`a`.`participa_aula_linguas_onde` AS `participa_aula_linguas_onde`,`a`.`participa_outras_atividades` AS `participa_outras_atividades`,`a`.`participa_outras_atividades_quais` AS `participa_outras_atividades_quais`,`a`.`meio_transporte_chegada_escola` AS `meio_transporte_chegada_escola`,`a`.`meio_transporte_saida_escola` AS `meio_transporte_saida_escola`,`a`.`pessoa_autorizada_retirar_aluno1` AS `pessoa_autorizada_retirar_aluno1`,`a`.`pessoa_autorizada_retirar_aluno2` AS `pessoa_autorizada_retirar_aluno2`,`a`.`pessoa_autorizada_retirar_aluno3` AS `pessoa_autorizada_retirar_aluno3`,`a`.`pessoa_autorizada_retirar_aluno4` AS `pessoa_autorizada_retirar_aluno4`,`a`.`autorizado_deixar_colegio_sozinho` AS `autorizado_deixar_colegio_sozinho`,`a`.`quem_fica_aluno_ausencia_pais` AS `quem_fica_aluno_ausencia_pais`,`a`.`relacionamento_mae` AS `relacionamento_mae`,`a`.`relacionamento_pai` AS `relacionamento_pai`,`a`.`reserva` AS `reserva`,`a`.`concomitante` AS `concomitante`,`a`.`cor_raca` AS `cor_raca`,`a`.`programa_bilingue` AS `programa_bilingue`,`a`.`curriculum_americano` AS `curriculum_americano`,`a`.`nao_divulgar_imagem` AS `nao_divulgar_imagem`,`a`.`prodesp` AS `prodesp`,`a`.`latitude` AS `latitude`,`a`.`longitude` AS `longitude`,`a`.`santanna_mais` AS `santanna_mais`,`a`.`importado` AS `importado`,`a`.`assist_medica_emergencia` AS `assist_medica_emergencia`,`a`.`obs_portaria` AS `obs_portaria`,`a`.`necessidade_educ_especial` AS `necessidade_educ_especial`,`a`.`possui_laudo` AS `possui_laudo` from ((`cadastro_alunos` `a` join `matriculas_alunos` `m` on((`a`.`ra` = `m`.`ra`))) join `cursos` `c` on((`m`.`curso` = `c`.`codigo`))) where ((`m`.`ano_matricula` = '2025') and ((`m`.`ano_letivo` = '2025_2026') or (`m`.`ano_letivo` = '2025')) and (`m`.`status` = 'MAT') and (`c`.`ativo` = 1) and (`c`.`complementar` = 0));

CREATE TABLE `familias` (
  `codigo` double NOT NULL,
  `nome_pai` varchar(255) DEFAULT NULL,
  `rg_pai` varchar(255) DEFAULT NULL,
  `cpf_pai` varchar(255) DEFAULT NULL,
  `nasc_pai` datetime DEFAULT NULL,
  `endereco_pai` varchar(255) DEFAULT NULL,
  `bairro_pai` varchar(255) DEFAULT NULL,
  `tel_cel_pai` varchar(255) DEFAULT NULL,
  `tel_res_pai` varchar(255) DEFAULT NULL,
  `cidade_pai` varchar(255) DEFAULT NULL,
  `estado_pai` varchar(255) DEFAULT NULL,
  `cep_pai` varchar(255) DEFAULT NULL,
  `fax_pai` varchar(255) DEFAULT NULL,
  `email_pai` varchar(255) DEFAULT NULL,
  `email_pai2` varchar(255) DEFAULT NULL,
  `empresa_pai` varchar(255) DEFAULT NULL,
  `cod_prof_pai` smallint DEFAULT NULL,
  `tel_emp_pai` varchar(255) DEFAULT NULL,
  `nome_mae` varchar(255) DEFAULT NULL,
  `rg_mae` varchar(255) DEFAULT NULL,
  `cpf_mae` varchar(255) DEFAULT NULL,
  `nasc_mae` datetime DEFAULT NULL,
  `endereco_mae` varchar(255) DEFAULT NULL,
  `bairro_mae` varchar(255) DEFAULT NULL,
  `tel_cel_mae` varchar(255) DEFAULT NULL,
  `tel_res_mae` varchar(255) DEFAULT NULL,
  `cidade_mae` varchar(255) DEFAULT NULL,
  `estado_mae` varchar(255) DEFAULT NULL,
  `cep_mae` varchar(255) DEFAULT NULL,
  `fax_mae` varchar(255) DEFAULT NULL,
  `email_mae` varchar(255) DEFAULT NULL,
  `email_mae2` varchar(255) DEFAULT NULL,
  `empresa_mae` varchar(255) DEFAULT NULL,
  `cod_prof_mae` smallint DEFAULT NULL,
  `tel_emp_mae` varchar(255) DEFAULT NULL,
  `telpaialuno` int DEFAULT NULL,
  `telmaealuno` int DEFAULT NULL,
  `endmaealuno` int DEFAULT NULL,
  `endpaialuno` int DEFAULT NULL,
  `falecido_pai` int DEFAULT NULL,
  `falecido_mae` int DEFAULT NULL,
  `estado_civil_pais` varchar(255) DEFAULT NULL,
  `nacionalidade_pai` smallint DEFAULT NULL,
  `nacionalidade_mae` smallint DEFAULT NULL,
  `grau_instrucao_pai` varchar(255) DEFAULT NULL,
  `grau_instrucao_mae` varchar(255) DEFAULT NULL,
  `codigo_formacao_pai` smallint DEFAULT NULL,
  `codigo_formacao_mae` smallint DEFAULT NULL,
  `conjuge_pai_nome` varchar(255) DEFAULT NULL,
  `conjuge_pai_telefone` varchar(255) DEFAULT NULL,
  `conjuge_mae_nome` varchar(255) DEFAULT NULL,
  `conjuge_mae_telefone` varchar(255) DEFAULT NULL,
  `estado_civil_pai` varchar(255) DEFAULT NULL,
  `estado_civil_mae` varchar(255) DEFAULT NULL,
  `pai_nova_uniao_marital` int DEFAULT NULL,
  `mae_nova_uniao_marital` int DEFAULT NULL,
  `tipo_resp1` varchar(45) DEFAULT 'Pai',
  `tipo_resp2` varchar(45) DEFAULT 'Mãe',
  `avisos_pedagogicos_resp1` tinyint DEFAULT NULL,
  `avisos_pedagogicos_resp2` tinyint DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `idx_familia_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `funcionarios` (
  `codigo` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `nacionalidade` smallint DEFAULT NULL,
  `natural_de` varchar(255) DEFAULT NULL,
  `reside` varchar(255) DEFAULT NULL,
  `nasc` date DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  `estcivil` varchar(255) DEFAULT NULL,
  `dt_cadastro` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `email_pessoal` varchar(255) DEFAULT NULL,
  `cert_nasc` varchar(255) DEFAULT NULL,
  `rg` varchar(255) DEFAULT NULL,
  `rg_emissao` date DEFAULT NULL,
  `cpf` varchar(255) DEFAULT NULL,
  `t_eleitoral` varchar(255) DEFAULT NULL,
  `zon_sec` varchar(255) DEFAULT NULL,
  `reservista` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `reserv_emissao` date DEFAULT NULL,
  `reserv_orgemissor` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `tel_cel` varchar(255) DEFAULT NULL,
  `tel_res` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `fax` varchar(255) DEFAULT NULL,
  `e_professor` int DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `obs` longtext,
  `senha` varchar(255) DEFAULT NULL,
  `horentrada` time DEFAULT NULL,
  `horalmocoinicio` time DEFAULT NULL,
  `horalmocofim` time DEFAULT NULL,
  `horsaida` time DEFAULT NULL,
  `departamento` varchar(255) DEFAULT NULL,
  `inativo` int DEFAULT NULL,
  `data_saida` date DEFAULT NULL,
  `end_numero` varchar(20) DEFAULT NULL,
  `end_complemento` varchar(45) DEFAULT NULL,
  `dt_admissao` date DEFAULT NULL,
  `rnm_numero` varchar(50) DEFAULT NULL,
  `rnm_validade` varchar(50) DEFAULT NULL,
  `rnm_prazo_residencia` varchar(50) DEFAULT NULL,
  `data_atualizacao_funcionario` datetime DEFAULT NULL COMMENT 'data de atualização de cadastro de funcionário. o funcionário deve atualizar a cada 6 meses.',
  `acesso_kids` tinyint DEFAULT '0',
  PRIMARY KEY (`codigo`),
  KEY `idx_funcionario_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2706 DEFAULT CHARSET=latin1;
-- fim - tabelas que já existem no banco de dados

-- início - tabelas da cantina

-- Tabela de funcionários da cantina
CREATE TABLE `cant_funcionarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL UNIQUE,
  `senha` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `tipo` enum('administrador', 'atendente', 'estoquista') NOT NULL DEFAULT 'atendente',
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_funcionarios_usuario` (`usuario`),
  KEY `idx_cant_funcionarios_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de tipos de produtos
CREATE TABLE `cant_tipos_produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_tipos_produtos_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos
CREATE TABLE `cant_produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo_produto_id` int NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque_atual` int NOT NULL DEFAULT 0,
  `estoque_minimo` int NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_produtos_codigo_barras` (`codigo_barras`),
  KEY `idx_cant_produtos_nome` (`nome`),
  KEY `idx_cant_produtos_tipo` (`tipo_produto_id`),
  CONSTRAINT `fk_cant_produtos_tipo` FOREIGN KEY (`tipo_produto_id`) REFERENCES `cant_tipos_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de contas de alunos
CREATE TABLE `cant_contas_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ra_aluno` int NOT NULL,
  `saldo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `limite_diario` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_contas_alunos_ra` (`ra_aluno`),
  CONSTRAINT `fk_cant_contas_alunos_ra` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de contas de funcionários da escola
CREATE TABLE `cant_contas_funcionarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_funcionario` int NOT NULL,
  `saldo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `limite_mensal` decimal(10,2) DEFAULT NULL,
  `consumo_mes_atual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `mes_referencia` date NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_contas_funcionarios_codigo_mes` (`codigo_funcionario`, `mes_referencia`),
  KEY `idx_cant_contas_funcionarios_codigo` (`codigo_funcionario`),
  CONSTRAINT `fk_cant_contas_funcionarios_codigo` FOREIGN KEY (`codigo_funcionario`) REFERENCES `funcionarios` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de restrições de produtos por aluno
CREATE TABLE `cant_restricoes_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ra_aluno` int NOT NULL,
  `tipo_restricao` enum('produto', 'tipo_produto') NOT NULL,
  `produto_id` int DEFAULT NULL,
  `tipo_produto_id` int DEFAULT NULL,
  `permitido` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_restricoes_alunos_ra` (`ra_aluno`),
  KEY `idx_cant_restricoes_alunos_produto` (`produto_id`),
  KEY `idx_cant_restricoes_alunos_tipo` (`tipo_produto_id`),
  CONSTRAINT `fk_cant_restricoes_alunos_ra` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`),
  CONSTRAINT `fk_cant_restricoes_alunos_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`),
  CONSTRAINT `fk_cant_restricoes_alunos_tipo` FOREIGN KEY (`tipo_produto_id`) REFERENCES `cant_tipos_produtos` (`id`),
  CONSTRAINT `chk_cant_restricoes_tipo` CHECK (
    (`tipo_restricao` = 'produto' AND `produto_id` IS NOT NULL AND `tipo_produto_id` IS NULL) OR
    (`tipo_restricao` = 'tipo_produto' AND `tipo_produto_id` IS NOT NULL AND `produto_id` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pacotes de alimentação
CREATE TABLE `cant_pacotes_alimentacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo_refeicao` enum('lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'personalizado') NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `dias_validade` int NOT NULL DEFAULT 30,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_pacotes_nome` (`nome`),
  KEY `idx_cant_pacotes_tipo` (`tipo_refeicao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos inclusos nos pacotes
CREATE TABLE `cant_pacotes_produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pacote_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `quantidade` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_pacotes_produtos_unique` (`pacote_id`, `produto_id`),
  KEY `idx_cant_pacotes_produtos_pacote` (`pacote_id`),
  KEY `idx_cant_pacotes_produtos_produto` (`produto_id`),
  CONSTRAINT `fk_cant_pacotes_produtos_pacote` FOREIGN KEY (`pacote_id`) REFERENCES `cant_pacotes_alimentacao` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cant_pacotes_produtos_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de compras de pacotes por alunos
CREATE TABLE `cant_pacotes_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ra_aluno` int NOT NULL,
  `pacote_id` int NOT NULL,
  `data_compra` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL,
  `refeicoes_restantes` int NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_cant_pacotes_alunos_ra` (`ra_aluno`),
  KEY `idx_cant_pacotes_alunos_pacote` (`pacote_id`),
  KEY `idx_cant_pacotes_alunos_data_fim` (`data_fim`),
  CONSTRAINT `fk_cant_pacotes_alunos_ra` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`),
  CONSTRAINT `fk_cant_pacotes_alunos_pacote` FOREIGN KEY (`pacote_id`) REFERENCES `cant_pacotes_alimentacao` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de vendas
CREATE TABLE `cant_vendas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_venda` varchar(20) NOT NULL UNIQUE,
  `tipo_cliente` enum('aluno', 'funcionario', 'dinheiro') NOT NULL,
  `ra_aluno` int DEFAULT NULL,
  `codigo_funcionario` int DEFAULT NULL,
  `funcionario_cantina_id` int NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `forma_pagamento` enum('conta', 'dinheiro', 'cartao', 'pix') NOT NULL DEFAULT 'conta',
  `valor_recebido` decimal(10,2) DEFAULT NULL,
  `valor_troco` decimal(10,2) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_venda` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_vendas_numero` (`numero_venda`),
  KEY `idx_cant_vendas_tipo_cliente` (`tipo_cliente`),
  KEY `idx_cant_vendas_ra_aluno` (`ra_aluno`),
  KEY `idx_cant_vendas_codigo_funcionario` (`codigo_funcionario`),
  KEY `idx_cant_vendas_funcionario_cantina` (`funcionario_cantina_id`),
  KEY `idx_cant_vendas_data` (`data_venda`),
  CONSTRAINT `fk_cant_vendas_ra_aluno` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`),
  CONSTRAINT `fk_cant_vendas_codigo_funcionario` FOREIGN KEY (`codigo_funcionario`) REFERENCES `funcionarios` (`codigo`),
  CONSTRAINT `fk_cant_vendas_funcionario_cantina` FOREIGN KEY (`funcionario_cantina_id`) REFERENCES `cant_funcionarios` (`id`),
  CONSTRAINT `chk_cant_vendas_cliente` CHECK (
    (`tipo_cliente` = 'aluno' AND `ra_aluno` IS NOT NULL AND `codigo_funcionario` IS NULL) OR
    (`tipo_cliente` = 'funcionario' AND `codigo_funcionario` IS NOT NULL AND `ra_aluno` IS NULL) OR
    (`tipo_cliente` = 'dinheiro' AND `ra_aluno` IS NULL AND `codigo_funcionario` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de itens da venda
CREATE TABLE `cant_vendas_itens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venda_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `quantidade` int NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `pacote_aluno_id` int DEFAULT NULL COMMENT 'Se o item foi consumido usando um pacote',
  PRIMARY KEY (`id`),
  KEY `idx_cant_vendas_itens_venda` (`venda_id`),
  KEY `idx_cant_vendas_itens_produto` (`produto_id`),
  KEY `idx_cant_vendas_itens_pacote` (`pacote_aluno_id`),
  CONSTRAINT `fk_cant_vendas_itens_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_vendas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cant_vendas_itens_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`),
  CONSTRAINT `fk_cant_vendas_itens_pacote` FOREIGN KEY (`pacote_aluno_id`) REFERENCES `cant_pacotes_alunos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações financeiras
CREATE TABLE `cant_movimentacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_conta` enum('aluno', 'funcionario') NOT NULL,
  `ra_aluno` int DEFAULT NULL,
  `codigo_funcionario` int DEFAULT NULL,
  `tipo_movimentacao` enum('credito', 'debito') NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `venda_id` int DEFAULT NULL,
  `funcionario_cantina_id` int DEFAULT NULL,
  `data_movimentacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_movimentacoes_tipo_conta` (`tipo_conta`),
  KEY `idx_cant_movimentacoes_ra_aluno` (`ra_aluno`),
  KEY `idx_cant_movimentacoes_codigo_funcionario` (`codigo_funcionario`),
  KEY `idx_cant_movimentacoes_venda` (`venda_id`),
  KEY `idx_cant_movimentacoes_data` (`data_movimentacao`),
  CONSTRAINT `fk_cant_movimentacoes_ra_aluno` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`),
  CONSTRAINT `fk_cant_movimentacoes_codigo_funcionario` FOREIGN KEY (`codigo_funcionario`) REFERENCES `funcionarios` (`codigo`),
  CONSTRAINT `fk_cant_movimentacoes_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_vendas` (`id`),
  CONSTRAINT `fk_cant_movimentacoes_funcionario_cantina` FOREIGN KEY (`funcionario_cantina_id`) REFERENCES `cant_funcionarios` (`id`),
  CONSTRAINT `chk_cant_movimentacoes_conta` CHECK (
    (`tipo_conta` = 'aluno' AND `ra_aluno` IS NOT NULL AND `codigo_funcionario` IS NULL) OR
    (`tipo_conta` = 'funcionario' AND `codigo_funcionario` IS NOT NULL AND `ra_aluno` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de estoque
CREATE TABLE `cant_estoque_historico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produto_id` int NOT NULL,
  `tipo_movimentacao` enum('entrada', 'saida', 'ajuste') NOT NULL,
  `quantidade` int NOT NULL,
  `estoque_anterior` int NOT NULL,
  `estoque_atual` int NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `venda_id` int DEFAULT NULL,
  `funcionario_cantina_id` int NOT NULL,
  `data_movimentacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_estoque_historico_produto` (`produto_id`),
  KEY `idx_cant_estoque_historico_venda` (`venda_id`),
  KEY `idx_cant_estoque_historico_funcionario` (`funcionario_cantina_id`),
  KEY `idx_cant_estoque_historico_data` (`data_movimentacao`),
  CONSTRAINT `fk_cant_estoque_historico_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`),
  CONSTRAINT `fk_cant_estoque_historico_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_vendas` (`id`),
  CONSTRAINT `fk_cant_estoque_historico_funcionario` FOREIGN KEY (`funcionario_cantina_id`) REFERENCES `cant_funcionarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View para consulta de alunos com seus responsáveis e contas
CREATE VIEW `cant_view_alunos_completo` AS
SELECT 
    a.ra,
    a.nome,
    a.nome_social,
    a.nasc,
    a.curso_nome,
    a.serie,
    a.turma,
    a.periodo,
    a.status,
    a.nome_resp,
    a.cpf_resp,
    a.nasc_resp,
    a.tel_cel_resp,
    a.email_resp,
    a.nome_resp_fin,
    a.cpf_resp_fin,
    a.nasc_resp_fin,
    ca.saldo,
    ca.limite_diario,
    ca.ativo as conta_ativa
FROM alunos a
LEFT JOIN cant_contas_alunos ca ON a.ra = ca.ra_aluno;

-- View para consulta de produtos com estoque baixo
CREATE VIEW `cant_view_produtos_estoque_baixo` AS
SELECT 
    p.id,
    p.codigo_barras,
    p.nome,
    p.preco,
    p.estoque_atual,
    p.estoque_minimo,
    tp.nome as tipo_produto,
    (p.estoque_minimo - p.estoque_atual) as quantidade_repor
FROM cant_produtos p
INNER JOIN cant_tipos_produtos tp ON p.tipo_produto_id = tp.id
WHERE p.estoque_atual <= p.estoque_minimo
  AND p.ativo = 1;

-- View para relatório de vendas por período
CREATE VIEW `cant_view_vendas_resumo` AS
SELECT 
    DATE(v.data_venda) as data_venda,
    v.tipo_cliente,
    COUNT(v.id) as total_vendas,
    SUM(v.valor_total) as valor_total_vendas,
    fc.nome as funcionario_cantina
FROM cant_vendas v
INNER JOIN cant_funcionarios fc ON v.funcionario_cantina_id = fc.id
GROUP BY DATE(v.data_venda), v.tipo_cliente, fc.nome;

-- View para consulta de pacotes ativos dos alunos
CREATE VIEW `cant_view_pacotes_alunos_ativos` AS
SELECT 
    pa.id,
    pa.ra_aluno,
    a.nome as nome_aluno,
    pac.nome as nome_pacote,
    pac.tipo_refeicao,
    pa.data_inicio,
    pa.data_fim,
    pa.refeicoes_restantes,
    pa.valor_pago
FROM cant_pacotes_alunos pa
INNER JOIN cadastro_alunos a ON pa.ra_aluno = a.ra
INNER JOIN cant_pacotes_alimentacao pac ON pa.pacote_id = pac.id
WHERE pa.ativo = 1 
  AND pa.data_fim >= CURDATE()
  AND pa.refeicoes_restantes > 0;

-- Trigger para atualizar saldo do aluno após venda
DELIMITER $$
CREATE TRIGGER `tr_cant_vendas_atualizar_saldo_aluno` 
AFTER INSERT ON `cant_vendas`
FOR EACH ROW
BEGIN
    IF NEW.tipo_cliente = 'aluno' AND NEW.forma_pagamento = 'conta' THEN
        UPDATE cant_contas_alunos 
        SET saldo = saldo - NEW.valor_total,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE ra_aluno = NEW.ra_aluno;
        
        INSERT INTO cant_movimentacoes (
            tipo_conta, ra_aluno, tipo_movimentacao, valor, 
            descricao, venda_id, funcionario_cantina_id, data_movimentacao
        ) VALUES (
            'aluno', NEW.ra_aluno, 'debito', NEW.valor_total,
            CONCAT('Venda #', NEW.numero_venda), NEW.id, NEW.funcionario_cantina_id, NEW.data_venda
        );
    END IF;
END$$
DELIMITER ;

-- Trigger para atualizar consumo do funcionário após venda
DELIMITER $$
CREATE TRIGGER `tr_cant_vendas_atualizar_consumo_funcionario` 
AFTER INSERT ON `cant_vendas`
FOR EACH ROW
BEGIN
    IF NEW.tipo_cliente = 'funcionario' AND NEW.forma_pagamento = 'conta' THEN
        UPDATE cant_contas_funcionarios 
        SET consumo_mes_atual = consumo_mes_atual + NEW.valor_total,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE codigo_funcionario = NEW.codigo_funcionario 
          AND mes_referencia = DATE_FORMAT(NEW.data_venda, '%Y-%m-01');
        
        INSERT INTO cant_movimentacoes (
            tipo_conta, codigo_funcionario, tipo_movimentacao, valor, 
            descricao, venda_id, funcionario_cantina_id, data_movimentacao
        ) VALUES (
            'funcionario', NEW.codigo_funcionario, 'debito', NEW.valor_total,
            CONCAT('Venda #', NEW.numero_venda), NEW.id, NEW.funcionario_cantina_id, NEW.data_venda
        );
    END IF;
END$$
DELIMITER ;

-- Trigger para atualizar estoque após venda
DELIMITER $$
CREATE TRIGGER `tr_cant_vendas_itens_atualizar_estoque` 
AFTER INSERT ON `cant_vendas_itens`
FOR EACH ROW
BEGIN
    DECLARE estoque_anterior INT;
    
    SELECT estoque_atual INTO estoque_anterior 
    FROM cant_produtos 
    WHERE id = NEW.produto_id;
    
    UPDATE cant_produtos 
    SET estoque_atual = estoque_atual - NEW.quantidade,
        data_atualizacao = CURRENT_TIMESTAMP
    WHERE id = NEW.produto_id;
    
    INSERT INTO cant_estoque_historico (
        produto_id, tipo_movimentacao, quantidade, estoque_anterior, 
        estoque_atual, motivo, venda_id, funcionario_cantina_id, data_movimentacao
    ) 
    SELECT 
        NEW.produto_id, 'saida', NEW.quantidade, estoque_anterior,
        estoque_anterior - NEW.quantidade, 
        CONCAT('Venda item #', NEW.id), NEW.venda_id, v.funcionario_cantina_id, v.data_venda
    FROM cant_vendas v 
    WHERE v.id = NEW.venda_id;
END$$
DELIMITER ;

-- Trigger para decrementar refeições de pacote
DELIMITER $$
CREATE TRIGGER `tr_cant_vendas_itens_decrementar_pacote` 
AFTER INSERT ON `cant_vendas_itens`
FOR EACH ROW
BEGIN
    IF NEW.pacote_aluno_id IS NOT NULL THEN
        UPDATE cant_pacotes_alunos 
        SET refeicoes_restantes = refeicoes_restantes - NEW.quantidade
        WHERE id = NEW.pacote_aluno_id;
    END IF;
END$$
DELIMITER ;

-- Stored Procedure para adicionar crédito na conta do aluno
DELIMITER $$
CREATE PROCEDURE `sp_cant_adicionar_credito_aluno`(
    IN p_ra_aluno INT,
    IN p_valor DECIMAL(10,2),
    IN p_funcionario_cantina_id INT,
    IN p_descricao VARCHAR(255)
)
BEGIN
    DECLARE v_conta_existe INT DEFAULT 0;
    
    -- Verifica se a conta do aluno existe
    SELECT COUNT(*) INTO v_conta_existe 
    FROM cant_contas_alunos 
    WHERE ra_aluno = p_ra_aluno;
    
    -- Se não existe, cria a conta
    IF v_conta_existe = 0 THEN
        INSERT INTO cant_contas_alunos (ra_aluno, saldo) 
        VALUES (p_ra_aluno, 0);
    END IF;
    
    -- Adiciona o crédito
    UPDATE cant_contas_alunos 
    SET saldo = saldo + p_valor,
        data_atualizacao = CURRENT_TIMESTAMP
    WHERE ra_aluno = p_ra_aluno;
    
    -- Registra a movimentação
    INSERT INTO cant_movimentacoes (
        tipo_conta, ra_aluno, tipo_movimentacao, valor, 
        descricao, funcionario_cantina_id, data_movimentacao
    ) VALUES (
        'aluno', p_ra_aluno, 'credito', p_valor,
        p_descricao, p_funcionario_cantina_id, CURRENT_TIMESTAMP
    );
END$$
DELIMITER ;

-- Stored Procedure para verificar se aluno pode consumir produto
DELIMITER $$
CREATE PROCEDURE `sp_cant_verificar_restricao_aluno`(
    IN p_ra_aluno INT,
    IN p_produto_id INT,
    OUT p_pode_consumir BOOLEAN
)
BEGIN
    DECLARE v_produto_restrito INT DEFAULT 0;
    DECLARE v_tipo_produto_restrito INT DEFAULT 0;
    DECLARE v_tipo_produto_id INT;
    
    -- Busca o tipo do produto
    SELECT tipo_produto_id INTO v_tipo_produto_id 
    FROM cant_produtos 
    WHERE id = p_produto_id;
    
    -- Verifica restrição específica do produto
    SELECT COUNT(*) INTO v_produto_restrito
    FROM cant_restricoes_alunos
    WHERE ra_aluno = p_ra_aluno 
      AND tipo_restricao = 'produto'
      AND produto_id = p_produto_id
      AND permitido = 0;
    
    -- Verifica restrição do tipo de produto
    SELECT COUNT(*) INTO v_tipo_produto_restrito
    FROM cant_restricoes_alunos
    WHERE ra_aluno = p_ra_aluno 
      AND tipo_restricao = 'tipo_produto'
      AND tipo_produto_id = v_tipo_produto_id
      AND permitido = 0;
    
    -- Define se pode consumir
    SET p_pode_consumir = (v_produto_restrito = 0 AND v_tipo_produto_restrito = 0);
END$$
DELIMITER ;

-- Stored Procedure para gerar número de venda
DELIMITER $$
CREATE PROCEDURE `sp_cant_gerar_numero_venda`(
    OUT p_numero_venda VARCHAR(20)
)
BEGIN
    DECLARE v_contador INT;
    DECLARE v_data_hoje VARCHAR(8);
    
    SET v_data_hoje = DATE_FORMAT(CURDATE(), '%Y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venda, 9) AS UNSIGNED)), 0) + 1 
    INTO v_contador
    FROM cant_vendas 
    WHERE numero_venda LIKE CONCAT(v_data_hoje, '%');
    
    SET p_numero_venda = CONCAT(v_data_hoje, LPAD(v_contador, 4, '0'));
END$$
DELIMITER ;

-- Inserir dados iniciais

-- Funcionário da cantina para teste
-- Usuário: admin, Senha: 123456
INSERT INTO `cant_funcionarios` (`usuario`, `senha`, `nome`, `email`, `tipo`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@cantina.com', 'administrador');

-- Tipos de produtos padrão
INSERT INTO `cant_tipos_produtos` (`nome`, `descricao`) VALUES
('Salgados', 'Produtos salgados como coxinhas, pastéis, etc.'),
('Doces', 'Produtos doces como brigadeiros, tortas, etc.'),
('Bebidas', 'Sucos, refrigerantes, água, etc.'),
('Lanches', 'Sanduíches, pães, etc.'),
('Refeições', 'Pratos principais, almoço, etc.');

-- Pacotes de alimentação padrão
INSERT INTO `cant_pacotes_alimentacao` (`nome`, `descricao`, `tipo_refeicao`, `preco`, `dias_validade`) VALUES
('Lanche da Manhã - Mensal', 'Pacote de lanche da manhã para 30 dias', 'lanche_manha', 150.00, 30),
('Almoço - Mensal', 'Pacote de almoço para 30 dias', 'almoco', 300.00, 30),
('Lanche da Tarde - Mensal', 'Pacote de lanche da tarde para 30 dias', 'lanche_tarde', 120.00, 30),
('Combo Completo - Mensal', 'Lanche manhã + Almoço + Lanche tarde', 'personalizado', 500.00, 30);

-- fim - tabelas da cantina