Only for Academic and Non-Commercial Use 

Thanks for Reading! 

Survey 

Computer Architecture and Systems 

Artificial Intelligence and Pattern Recognition 

Computer Graphics and Multimedia 

Data Management and Data Mining 

Software Systems 

Computer Networks and Distributed Computing 

Theory and Algorithms 

Emerging Areas 

JCST URL: https://jcst.ict.ac.cn 

E-mail: jcst@ict.ac.cn 

Twitter: JCST_Journal 

LinkedIn: Journal of Computer Science and Technology 

jCST 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/9b2827349db968be89b14d3cf5a1ca6f55d7c705747c670d9c760d948fadd40c.jpg)


Journal of Computer Science and Technology
Special Issue: Consulting the 40 n Anniversary of JCCST 

Yu JF, Zhang-Li D, Zhang ZY et al. From MOOC to MAIC: Reimagine online teaching and learning through LLM-driven agents. JOURNAL OF COMPUTER SCIENCE AND TECHNOLOGY, 41(1): 394-414, Jan. 2026. DOI: 10.1007/s11390-025-6000-0, CSTR: 32374.14.s11390-025-6000-0 

# From MOOC to MAIC: Reimagine Online Teaching and Learning Through LLM-Driven Agents

Ji-Fan Yu $^{1}$ (于济凡), Daniel Zhang-Li $^{2}$ (张李牛牛), Zhe-Yuan Zhang $^{2}$ (张哲源), Yu-Cheng Wang $^{2}$ (王禹诚)
Hao-Xuan Li $^{3}$ (黎昊轩), Joy Jia Yin Lim $^{2}$ (林佳音), Zhan-Xin Hao $^{1}$ (郝展欣), Shang-Qing Tu $^{2}$ (涂尚卿)
Lu Zhang $^{1}$ (张露), Xu-Sheng Dai $^{1}$ (戴旭升), Jian-Xiao Jiang $^{1}$ (蒋建骁), Shen Yang $^{1}$ (杨慎)
Fei Qin $^{1}$ (覃菲), Ze-Kun Li $^{1}$ (李泽坤), Bing-Lin Liu $^{2}$ (刘炳麟), Xin Cong $^{4}$ (从鑫)
Bin Xu $^{2}$ (许斌), Distinguished Member, CCF, Lei Hou $^{2}$ (侯磊), Man-Li Li $^{1}$ (李曼丽), Juan-Zi Li $^{1}$ (李涓子)
Hui-Qin Liu $^{1,*}$ (刘惠琴), Yu Zhang $^{1}$ (张羽), Zhi-Yuan Liu $^{2,*}$ (刘知远), Distinguished Member, CCF
and Mao-Song Sun $^{2}$ (孙茂松), Distinguished Member, CCF

$^{1}$ School of Education, Tsinghua University, Beijing 100084, China 

$^{2}$ Department of Computer Science and Technology, Tsinghua University, Beijing 100084, China 

$^{3}$ College of AI, Tsinghua University, Beijing 100084, China 

$^{4}$ Department of Statistics and Data Science, Tsinghua University, Beijing 100084, China 

E-mail: yujifan@tsinghua.edu.cn; zlnn23@mails.tsinghua.edu.cn; zheyuan4@andrew.cmu.edu wang-yc24@mails.tsinghua.edu.cn; hx-li25@mails.tsinghua.edu.cn; lin-jy23@mails.tsinghua.edu.cn zhanxin_hao@mail.tsinghua.edu.cn; tsq25@mails.tsinghua.edu.cn; lou-zhan24@mails.tsinghua.edu.cn dxs23@mails.tsinghua.edu.cn; jjx23@mails.tsinghua.edu.cn; yangshen22@mails.tsinghua.edu.cn qinfei.2018@tsinghua.org.cn; li-zk25@mails.tsinghua.edu.cn; lbl23@mails.tsinghua.edu.cn; congxin1995@tsinghua.edu.cn; xubin@tsinghua.edu.cn; houlei@tsinghua.edu.cn; marylee@mail.tsinghua.edu.cn lijuanzi@tsinghua.edu.cn; liuhq@tsinghua.edu.cn; zhangyu2011@tsinghua.edu.cn; liuzy@tsinghua.edu.cn sms@tsinghua.edu.cn 

Received September 30, 2025; accepted December 30, 2025. 

Abstract Since the first instances of online education, where courses were uploaded to accessible and shared online platforms, this form of scaling the dissemination of human knowledge to reach a broader audience has sparked extensive discussion and widespread adoption. Since personalized learning still holds significant potential for improvement, new artificial intelligence (AI) technologies have been continuously integrated into this learning format, resulting in a variety of educational AI applications such as educational recommendation and intelligent tutoring. The emergence of intelligence in large language models (LLMs) has allowed these educational enhancements to be built upon a unified foundational model, enabling deeper integration. In this context, we propose MAIC (Massive AI-Empowered Course), a new form of online education that leverages LLM-driven multi-agent systems to construct an AI-augmented classroom, balancing scalability with adaptivity. Beyond exploring the conceptual framework and technical innovations, we conduct preliminary experiments at Tsinghua University, Beijing, one of the leading universities in China. Drawing from more than 100 000 learning records of more than 500 students, we obtain a series of valuable observations and initial analyses. This project will continue to evolve, ultimately aiming to establish a comprehensive open platform that supports and unifies research, technology, and applications to explore the possibilities of online education in the era of large-model AI. We envision this platform as a collaborative hub that brings together educators, researchers, and innovators to collectively explore 

the future of AI-driven online education. 

Keywords intelligent tutoring system, large language model (LLM), multi-agent system, online education 

## 1 Introduction

Explicit Background: Evolution for Scalability. The evolution of online education stands as a testament to humanity's relentless pursuit of knowledge, transcending the limitations of time and space[1]. From the humble beginnings of oral tradition to the advent of the printed book[2, 3], education has continuously sought ways to expand its reach. However, for centuries, the traditional model of education was bound by the constraints of physical classrooms, limited resources, and localized instruction. The dawn of the Internet marked a revolutionary shift, heralding the age of online education, where the dream of universal access to knowledge began to take a tangible form. Specifically, the Massive Open Online Course (MOOC) phenomenon marks a significant milestone in the evolution of online education, reflecting both technological advancement and educational innovation $^{[4]}$ . Since then, platforms such as edX $^{①}$ , which involves institutions such as MIT and Harvard, and Coursera $^{②}$ , which originates from Stanford, have integrated learning resources from more than 270 renowned universities $^{[5, 6]}$ . These platforms have attracted more than 100 million learners globally, progressively realizing the scalability of online education. 

Implicit Motivation: Determination of Adaptivity. However, this paradigm of serving thousands of learners from diverse backgrounds through one pre-recorded video $^{[7]}$ (as shown in Fig.1) struggles to align with the educational philosophy of “teaching in accordance with individual aptitudes” $^{[8, 9]}$ . This challenge has become a significant reason for the subsequent efforts that introduce AI techniques into online learning. To achieve the adaptivity of learning, a series of tasks such as learning path planning $^{[10, 11]}$ , course recommendation $^{[12-14]}$ , and intelligent tutoring $^{[15, 16]}$ —driven by technologies like recommendation systems and dialogue generation—have been employed to enhance the student learning experience. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/a5dfd1a6b9a3f5950c76320864c0f13ba3170567f60ac4dc83e7573038438e26.jpg)



Fig.1. MOOC vs MAIC (Massive AI-Empowered Course) from the aspects of teaching and learning.


Although these technologies have been applied across various aspects of teaching and learning, the significant differences among the supporting tasks before, during, and after instruction have posed challenges for unifying them under a single deep learning framework $^{[17]}$ . Such fragmentation has, in part, delayed the emergence of a new platform where AI and online learning are fully integrated. However, with the rapid advancement of generative AI $^{[18]}$ , large language models (LLMs) have created fresh opportunities for AI-powered learning paradigms. Models such as GPT-4 $^{[19]}$ and LLaMA $^{[20]}$ possess strong generalization capabilities and encapsulate vast parametric knowledge, allowing for the flexible configuration of intelligent agents $^{[21]}$ built upon them. Currently, LLM-driven multi-agent systems $^{[22]}$ have already been explored for applications such as social simulation $^{[23]}$ and the execution of complex tasks such as software development $^{[24]}$ . This progress opens up a potential pathway for introducing multi-agent systems to create entirely new online teaching and learning experiences. 

Proposal of MAIC. At the critical juncture of a new era defined by LLMs and multi-agent systems in online education, we introduce MAIC (Massive AI-Empowered Course). MAIC is dedicated to exploring the integration of multi-agent systems across various stages of online learning, including course construction, project-based learning, classroom instruction, and analysis, with the goal of balancing the scalability and adaptivity of online education. The core concept of MAIC is to construct a series of LLM-driven agents to support the whole teaching and learning processes in the online educational environment. As shown in Fig.1, the paradigm of MOOC and MAIC can be featured with two primary aspects as follows. 

Teaching. This action is primarily performed by instructors. In MOOCs, instructors are responsible for thoroughly preparing course materials, drafting lecture notes, and spending considerable time meticulously recording courses. The final output typically consists of a series of pre-recorded instructional videos. Within the proposed MAIC framework, instructors initiate the course development process by uploading diverse raw instructional resources. Leveraging a collaborative multi-agent architecture with human-in-the-loop oversight, the system facilitates the interactive construction of didactic slide decks and the automated provisioning of associated experiential learning environments. This integrated pipeline enables end-to-end AI-assisted authoring of courses, spanning pedagogical content structuring, multimodal resource synthesis, and computational environment orchestration, thus streamlining the scalable production of AI-centric curricula. 

Learning. In MOOCs[7], a single set of course materials is designed to serve thousands of students with diverse backgrounds, and the pace of instruction is predetermined by instructors, leaving room for improving personalized adaptation based on individual student needs[25]. In MAIC, course delivery is autonomously completed by AI instructor agents that dynamically adapt pedagogical strategies in real time, conditioned on multimodal student interaction traces and latent knowledge state estimation. The system further deploys role-specialized AI peers, including teaching assistants and customizable classmates, which enables learners to curate personalized collaborative ecologies for dialectical engagement, affective support, and metacognitive prompting. Crucially, MAIC extends adaptive learning to cooperative tasks, in which students are assigned to finish the given tasks with peer AI agents. It integrates real-time adaptation, social learning, and contextual task generation, aiming to guide students with suitable challenges. 

In this paper, we introduce the concept of MAIC, and present an intuitive and user-friendly solution that accommodates the needs of various users, including students and educators. This platform comes pre-equipped with a suite of intelligent agents and tools that support course analysis and the construction of new MAIC course examples. Additionally, MAIC integrates several learning analytics tools powered by large models, enabling quick access to learning data, forecasting academic outcomes, and automating tasks such as interviews and assessments. 

With the support of Tsinghua University, Beijing, one of China's top universities, we conduct an exploration of this new learning model over a period of more than three months. Assisted by over 500 student volunteers, we implement the study using two courses: the AI course “Towards Artificial General Intelligence” (TAGI) and the learning science course “How to Study in the University” (HSU). During this pilot, we collect over 100 000 behavioral records. Based on the data from these courses, along with student survey measurements and qualitative interview results, we conduct an initial analysis of the features and performance of the MAIC system. In subsequent sections, we will introduce key components, technical implementation, and real-world results $^{③}$ . 

## 2 Related Work

The evolution of education has undergone several transformative phases $^{[5, 14, 26]}$ . Below, we review the developments in chronological order. 

Pre-ITS Era. Before the rise of intelligent tutoring systems (ITSs) $^{[27]}$ , education was dominated by traditional paradigms such as Aristocratic Education $^{[28]}$ and Classroom Education $^{[29]}$ , which were constrained by physical and temporal limitations. The advent of the Internet led to scalable education paradigms such as MOOC $^{[30]}$ and Live Class $^{[31]}$ . While these platforms significantly broadened access, they lacked individualized support, highlighting the need for more responsive educational technologies. Some rule-based intelligent tutoring systems were proposed in 1990s $^{[32]}$ , which opened a path to more scalable education systems $^{[33]}$ . 

Deep Learning Stage. Early AI integrations into education began with Question Answering (QA) systems, which aim to emulate pedagogical interactions. Systems such as Knowledge-Based Question Answering (KBQA) $^{[34]}$ and methods inspired by Socratic Questioning $^{[35]}$ allow for basic automated dialogue. Landmark systems such as AutoTutor $^{[36]}$ and SCOT $^{[37]}$ support natural language interactions, yet are limited by predefined scripts and knowledge boundaries. More recent systems such as MAssistant $^{[38]}$ improve contextual understanding but still operate within narrow functional scopes. To address the need for personalized learning pathways, adaptive testing systems emerged $^{[39]}$ . Techniques such as Deep Knowledge Tracing (DKT) $^{[40]}$ , and NeuralCD (Neural Cognitive Diagnosis) $^{[41]}$ use machine learning to dynamically adjust question difficulty and content based on learner performance. 

LLM Age. With advances in LLMs, educational chatbots gained prominence. Systems such as Khanmigo $^{④}$ and ChatGPT-Edu $^{⑤}$ leverage LLMs to provide more flexible and context-aware interactions. These platforms enable continuous dialogue and support across diverse subjects, offering a more immersive experience than earlier QA systems. Building on chatbot capabilities, single-agent systems such as EduChat $^{[42]}$ and LittleMu $^{[16]}$ integrate additional educational functionalities, such as feedback generation and exercise recommendation, within a unified AI agent. The limitations of single-agent systems prompted research into collaborative multi-agent architectures for more complex educational tasks. Frameworks such as CODIA $^{⑥}$ and the proposed MA-IC leverage LLM-driven agents, where these systems support rich, synchronous classroom-like experiences and scale personalized instruction through agent cooperation. By distributing capabilities across specialized modules, they achieve a new level of adaptivity and engagement. 

Towards Ideal ITS. The ultimate goal of ITSs is to create an adaptive, empathetic, and cognitively supportive learning environment—an ideal ITS. While current systems, including multi-agent platforms, have made significant strides, persistent gaps remain. Achieving this vision hinges on two axes: 1) scalability-cost-efficient authoring, deployment, and delivery at massive scale; 2) adaptivity-fine-grained, real-time diagnosis and guidance tailored to each learner. 

## 3 MAIC

In this section, we introduce the major components for implementing the MAIC platform. Specifically, we present the main workflows designed for certain teaching process and the adaptive engine integrated with the designed multi-agent learning environment, shown in Fig.2. 

## 3.1 Teaching: MAIC Course Preparation

MAIC-Craft: Anything to MAIC. MAIC-Craft is a sub-system in MAIC that develops a standardized course preparation workflow (shown in Fig.3) to transform vast amounts of weakly structured and heterogeneous learning resources into highly structured and adaptive learning materials, unifying the ingestion and structuring of diverse formats and modalities. Targeting at scalability, this workflow is designed to streamline the workload of experts while accommodating diverse educational resource formats, facilitating the scalability of this online learning model for broader implementation. The course preparation workflow of MAIC-Craft consists of two stages: read 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/ef71ba067ac4946a2062398970f39e5b73eb3f9a1b4aaa9f9d4df202832e9a50.jpg)



Fig.2. Illustration of the conceptual structure of MAIC. RAG: retrieval-augmented generation.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/5d21119c339d267b276195f13b9630f2339d7c6215f647e7b4b3c77fe5fedeb9.jpg)



Fig.3. Illustration of the course preparation workflow of MAIC-Craft. (a) Read stage. (b) Plan stage.


and plan. 

## 3.1.1 Read Stage

At this stage, instructors (and authorized teaching assistants) are involved by providing any educational material. With the assistance of multi-agent systems empowered by LLMs, they upload a set of educational resources $R = \{R_i\}^{1 \leq i \leq |\mathcal{R}|}$ , which can include course slides, textbooks, videos, audio lectures, or any combination thereof. These resources are then transformed into highly structured intelligent learning resources $\tilde{\mathcal{R}} = \{(R_i, D_i, K)\}^{1 \leq i \leq |\mathcal{R}|}$ along with multiple AI agents designed for classroom construction. The $R_i$ and $D_i$ here correspond to a single resource unit and its comprehensive textual description, respectively, while K denotes the knowledge-aware section extracted from each resource. 

Multimodal Content Extraction. MAIC-Craft employs multimodal LLMs (MLLMs) to capture content across diverse modalities. For any given educational resource, the system extracts textual content $R_{i}^{t}$ and visual content $R_{i}^{v}$ , where $R_{i}^{t}$ encompasses direct textual content, transcribed content from audio sources, i.e., $f_{T}^{1}:R_{i}\to(R_{i}^{t},R_{i}^{v})$ . This functional model $f_{T}^{1}$ leverages multimodal architectures and can be continuously improved through emerging LLM techniques. The implementation integrates vision-language models for visual processing, automatic speech recognition for audio transcription, and document parsers for textual extraction, all within a unified processing pipeline. 

Knowledge Base Construction. After preprocessing the uploaded resources, MAIC-Craft employs extraction functions to complete the read stage. The multimodal content $(R_{i}^{\mathrm{t}}, R_{i}^{\mathrm{v}})$ is processed by an ML-LM-based method that generates comprehensive and pedagogically-aware descriptions, i.e., $f_{T}^{2}: (R_{i}^{\mathrm{t}}, R_{i}^{\mathrm{v}}) \to D_{i}$ . Simultaneously, MAIC-Craft implements a knowledge extraction methodology that organizes the educational content into a structured knowledge base, building taxonomic relationships across different resource modalities, i.e., $f_{T}^{3}: (R_{i}^{\mathrm{t}}, R_{i}^{\mathrm{v}}, D_{i}) \to K$ , where K represents the structured knowledge base components that constitute the final structured resource set $\tilde{R}$ . The knowledge base maintains long-context coherence across extensive educational content and teaching smoothness. 

## 3.1.2 Plan Stage

At this stage, instructors (and authorized teaching assistants) are involved through human-AI collaborative refinement processes. Based on the highly structured resources, MAIC-Craft constructs an instructional action representation language, enabling the incorporation of flexible teaching functions such as interactive content presentation, adaptive questioning, and multimodal content delivery into preset classrooms. This naturally integrates with related educational technologies like lecture script generation and adaptive question generation. Meanwhile, leveraging intelligent agent construction techniques, the platform utilizes the processed content to provide teachers with AI-driven pedagogical agents, facilitating comprehensive course planning and foundational structure development. 

Course Component Generation. MAIC-Craft conceptualizes educational activities as structured course components. Each course component $\overline{C}$ is defined as $\overline{C} = (\text{type}, \text{content}, \text{metadata})$ , where type indicates the component category (e.g., Canvas, Quiz, LectureScript), content details the educational material, and metadata provides pedagogical context. This approach reflects principles of modularity and extensibility, allowing course components to be easily configurable and reusable across different educational contexts. 

Each component is associated with the generation of specific type of educational content, denoted as $(\mathcal{C}_{n}, \hat{R}_{C})$ . Among these components, the most fundamental component category is Canvas, as it constitutes the core visual presentation framework of the instructional process. Category Canvas components integrate visual layouts, interactive elements, and structured content presentation, while category Quiz components provide question generation and assessment logic, and category LectureScript components supply narrative guidance. Based on this foundation, MAIC-Craft provides a course content generation pipeline based on long-context encoding methods and multimodal understanding, supporting both fundamental teaching procedures and interactive components, i.e., $f_{T}^{4}: \tilde{R} \to \tilde{R}_{components}$ . The system provides component generation functions such as $f_{T}^{5}: \tilde{R} \to \tilde{R}_{quiz}$ for quiz creation. All generated components are subject to instructor review and refinement, ensuring pedagogical quality and correctness. 

Agent Generation. Instructors can provide personalized pedagogical information (including teaching styles, voice characteristics, and supplementary course materials) to build customized teaching agents, such as teacher agent $a_{T}$ and teaching assistant agent $a_{TA}$ . MAIC-Craft provides agentization toolkits implemented via LLMs, supporting high-level customization of these pedagogical agents. The uploaded supplementary materials are segmented and integrated into different intelligent agents using the RAG (retrieval-augmented generation) technology, enabling contextually-aware and personalized educational interactions. These technological innovations are thoroughly evaluated in concurrent academic investigations. 

## 3.2 MAIC Adaptive Engine

To address the limitations of standardized curricula, MAIC introduces the adaptive engine, which dynamically transforms uniform instructional text into learner-specific content conditioned on each student's background and interests. Specifically, we employ a two-stage pipeline: 1) cognitive student modeling, which constructs a detailed profile for each student, and 2) token-level personalization, which adapts scripts at a granular level. 

## 3.2.1 Cognitive Student Modeling

Effective personalization begins with a comprehensive student model. Meanwhile, as LLM-based knowledge tracing techniques become more mature $^{[43]}$ , we employ a conversational agent to engage the student in a natural dialogue to capture both academic and affective data. Academic features (e.g., major, year) inform an initial estimate of the student's knowledge, while affective features (e.g., interests, hobbies) provide context for enhancing the script's relevance and engagement. The unstructured conversational history is then parsed by a summarization agent. This agent extracts salient details and organizes them into a structured profile containing machine-readable tags (e.g., Domain: Sport. Category: Basketball), which serves as a robust and actionable model for personalization. Listing A1 $^{7}$ shows an example of our constructed student profile. 

## 3.2.2 Token-Level Personalization

Based on the established student model, we adapt the standardized script to the student's needs. Our objective is to perform subtle, token-level adjustments that enhance relevance and engagement without altering the core pedagogical content. This process unfolds in two primary phases: knowledge retrieval and content adaptation. 

Open-Ended Knowledge Retrieval. To ground the personalization in factually accurate and contextually-rich information, we design an open-ended retrieval mechanism, which mitigates the risk of LLM hallucinations by providing relevant, up-to-date information for the generation phase. First, we employ an LLM to analyze the student model and the educational topic of the standardized content, and create precise search queries. These queries are then executed, and the results undergo retrieval and filtering to prioritize high-quality educational and scholarly sources. Subsequently, the retrieved documents are segmented into semantic chunks, embedded as vectors, and stored in a temporary vector database. We identify the top-k most relevant chunks based on their cosine similarity to the original content, to serve as supplementary context for the next generation phase. 

Pedagogically-Guided Content Adaptation. In the final phase, we employ an RAG framework to rewrite the educational script while maintaining instructional integrity. Initially, a rule-based filter assesses content segments to determine their personalization suitability, preserving short, transitional, or elementary sentences in their original form. For eligible segments, we design a structured prompt to guide the content generation, operationalizing established pedagogical theories, as follows. 

1) Bloom's taxonomy: to ensure adaptations appropriately scaffolded across a hierarchy of cognitive levels, from basic knowledge to advanced synthesis. 

2) Vygotsky's zone of proximal development (ZPD): to select and adapt content that is optimally challenging and promotes learning. 

3) Universal design for learning (UDL): to inform diverse adaptations, such as contextually relevant analogies and illustrative examples. 

This prompt is explicitly constrained to preserve core concepts, maintain logical structure, and make only subtle changes. To ensure a natural and coherent output, it removes any direct mentions of personalization (e.g., “Based on your interest...”). This principled approach ensures the final content is not only personalized, but also pedagogically effective. 

## 3.3 Learning: Multi-Agent Classroom

Building on Subsections 3.1 and 3.2, focusing on scalability and adaptivity, real deployments must balance and co-optimize in both directions. We then dive into the details of the environment (shown in Fig.4), a carefully designed multi-agent education environment that couples scale-efficient orchestration with learner-level personalization. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/bad11c6581d3ce1f09e64b7f4a94c61669330be5557d66fcd18d308da2825328.jpg)



Fig.4. Illustration of the classroom learning environment of MAIC. (a) Course management. (b) Interactions in MAIC.


## 3.3.1 Environment Principles

MAIC-CPL: Classroom Peer Learning. Student learning in MAIC follows a “1 Student user + N AI Agents” model. In such an environment, the AI teacher controls the learning progress based on the highly structured instructional action representation language mentioned earlier, explains course content, poses questions, and navigates PowerPoint slides, while the AI teaching assistant maintains classroom order and prevents content deviation. Students can interrupt the teacher at any time, ask questions, and engage in discussions, and the intelligent agents continuously adjust the teaching process and some content based on the students’ performance. The design principles for constructing this immersive adaptive classroom originate from the following two concerns $^{[44]}$ . 1) How to ensure that the classroom covers the core classroom behaviors? 2) How to maintain the entirety of the interaction within the natural flow during the class? 

In addressing the first concern, we systematically classify classroom interaction behaviors in accordance with established educational principles, as delineated in Schwanke's seminal work $^{[45]}$ . 1) Teaching and Initiation (TI) encompasses the instructive actions of the teacher and the responsive feedback or insights provided by students; 2) In-depth Discussion (ID) involves the alignment, deliberation, and iterative question-and-answer exchanges between the teacher and students, which are instrumental in facilitating students' conceptual comprehension; 3) Emotional Companionship (EC) pertains to the encouragement of student learning, the cultivation of a conducive learning environment, and the provision of emotional sustenance; 4) Classroom Management (CM) refers to the maintenance of order, the organization of disruptive elements, and the steering of classroom discourse. 

Recognizing that these pedagogical behaviors manifest through diverse class roles (represented as $\widehat{A}_{r}=\{r_{i}\}^{\left|\widehat{A}_{r}\right|}$ , with each $r_{i}$ signifying a distinct role), it is imperative to ensure the variety and breadth of the agents' roles within the educational setting. 

Addressing the second concern, we emphasize the necessity of meticulously and rhythmically orchestrating the interactions among the various agents within the system, in harmony with the course content. We introduce an innovative session controller designed to regulate the flow of classroom interactions, contingent upon the class's dynamic state and under the aegis of a central managerial agent[22]. 

Based on these principles, we design multiple classmate agents for diverse roles, implement class control, and ultimately derive the multi-agent classroom process. 

## 3.3.2 Classmate Agents

To enhance the educational experience and emulate the dynamics of traditional classroom settings, we currently preset a variety of student-like agents, each imbued with unique personality traits, to complement the teaching agents. These agents are designed to perform roles similar to those of peers, enriching the interactive landscape of the learning environment. In this scholarly work, we introduce an initial set of four archetypal student agents, while also providing users with the flexibility to customize and introduce additional engaging student agents onto the educational platform. Each agent $a_{i} \in A$ is facilitated through prompting LLMs and associated with one or more class roles, denoted as: $\mathcal{A} = \rho(LLM, prompt_{A})$ , $A \Leftrightarrow \widehat{A}_{r}$ , where $\rho$ is the role customization operation, and $P_{A}$ is the system prompt with agent description $^{[44]}$ . 

- Class Clown (TI, EC, CM). To spark creativity, engender a lively classroom ambiance, and act as a supportive peer, this agent also assists the teacher in steering the class's focus when the learner's attention wanders. 

- Deep Thinker (TI, ID). It is designed to facilitate profound contemplation and to pose thought-provoking questions that challenge and extend the intellectual boundaries of the classroom. 

- Note Taker (TI, CM). With a penchant for summarizing and disseminating key points from class discussions, it assists in cognitive organization and the retention of information for all participants. 

- Inquisitive Mind (TI, EC). Characterized by a propensity for inquiring about lecture content, it fosters a culture of inquiry and dialogue, prompting others to engage in critical thinking and collaborative discourse. 

Unlike Standardized Operating Procedures (SOPs) commonly used in multi-agent systems $^{[24, 46]}$ , classroom scenarios function as dynamic, interactive environments without rigid workflows, resembling an evolving group discussion. In these settings, agents must determine the appropriate timing for their interactions, adapting to the fluid nature of classroom discourse. To address this need, we design a controller that observes classroom dynamics, makes informed decisions, and manages agent behaviors based on the current state of the class. The session controller is composed of the class state receptor and the manager agent. 

## 3.3.3 Classroom Management

Class State Receptor. The Class State Receptor captures the ongoing classroom dialogue, with the history up to time t represented as $H_{t}=\bigcup(u_{i}^{\boldsymbol{a}_{j}})^{t}$ , where $u_{i}$ is the utterance made by agent $a_{j}$ or a user (denoted as $au$ ). The class state $S_{t}$ integrates this interaction data, structured as $S_{t}=\left\{P_{t},H_{t}|\widehat{A}_{r}\right\}$ . Here, $P_{t}\subseteq P$ represents the learning materials covered up to time t. This design prioritizes adaptability and real-time decision making, aligning with pedagogical principles that emphasize responsiveness to the evolving needs of learners within an educational setting. 

Manager Agent. MAIC contains a hidden meta-agent responsible for regulating the dynamics of classroom interactions. This agent receives the current state of the class $S_{t}$ , monitors the flow of the class, interprets ongoing activities, and determines the subsequent action to be executed, ensuring that the learning environment remains adaptive and responsive. The task $f_{L}$ of the Manager Agent can be formally defined as $f_{\mathcal{L}}: \mathcal{S}_{t} \to \{(\boldsymbol{a}_{t}, \Theta) | \boldsymbol{a}_{t} \in \mathcal{A}, \Theta_{n} \Leftarrow \Theta\}$ , where $\Theta_{n}$ denotes a specific function and the selected action will be carried out, transitioning the class to the next state. After executing an action, the system enters a waiting phase for a time window $\tau$ . During this period, if a user responds or waiting time elapses, the Manager Agent is triggered to make a new decision. This design reflects key educational principles by prioritizing a learner-centered approach, maintaining fluid class engagement, and promoting timely and contextually relevant instructional adjustments, thereby enhancing the overall educational experience. 

This classroom management method is the core of MAIC's learning stage. Currently, we collect sufficient interaction data and employ several foundation models $^{[47, 48]}$ via fine-tuning or context engineering for implementation. 

## 3.3.4 Cooperative Tasks with Peer Agents

We also implement a toy environment in which a student collaborates with $N$ AI peer agents to complete a designed task by the course teacher. The task is divided into milestones, issues, defined by a brief instruction, and collaborative agents involved. The setup enforces accountable participation by assigning clear ownership to the student and limiting unsolicited assistance, reducing cognitive offloading. A counselor agent monitors interactions and adaptively adjusts scaffolding to match the student's performance, providing guidance without removing challenge. To cultivate real-world collaboration skills, agents reveal only partial reasoning and execution states, prompting the student to coordinate, request information, and plan jointly rather than consume fully completed outputs. 

## 4 Key Technique Evaluation

MAIC is a complex LLM-based intelligent agent system that encompasses various specific technologies. In line with our design targets, we evaluate the techniques along two axes: scalability and adaptivity. Specifically, the teaching system involves multiple processes for content generation and knowledge understanding, while on the learning side, it requires evaluating the effectiveness of agent construction and classroom management capabilities. We focus on presenting two core functions: lecture script generation and course management, which are fundamental to the teaching and learning aspects of MAIC. The evaluation of other technologies will be continuously updated. Notably, these assessments provide only an initial view of specific aspects of MAIC and its effectiveness in real-world practice will be further explored in Section 5. 

## 4.1 Learning Material Generation Evaluation

To validate MAIC-Craft's core generation capabilities, we evaluate the multimodal content understanding and pedagogical synthesis technologies that power our Read-Generation pipeline. While MAIC-Craft extends beyond script generation to encompass complete course creation, these foundational technologies are essential for all generation stages. 

## 4.1.1 Experimental Setup

The evaluation task is to automatically generate pedagogically effective lecture scripts from presentation slides, where the system must process multimodal slide content (text, images, diagrams) and produce coherent instructional narratives suitable for classroom delivery. We assess MAIC-Craft using 20 diverse university presentations spanning STEM and humanities disciplines. The evaluation compares our integrated processing approach against established baselines: 1) iterative processing, which generates scripts slide-by-slide without cross-page context, and 2) direct prompting, which applies basic multimodal generation without pedagogical guidance. 

## 4.1.2 Evaluation Metrics

Following established evaluation frameworks in educational content generation $^{[17, 49]}$ , we assess both automated and human-judged dimensions. For automated evaluation, we measure: 1) content understanding (content), which measures how well the generated scripts accurately reflect and synthesize information from the presentation slides; 2) long-context coherence (coherence), which assesses whether scripts maintain narrative consistency and logical flow across the entire presentation; and 3) pedagogical design (pedagogy), which evaluates the quality of instructional tone, clarity, and learner engagement in the generated scripts. For human evaluation, drawing from the Community of Inquiry framework $^{[50]}$ , we assess: 1) consistency—the factual accuracy and alignment with source slide content; 2) readability—the linguistic fluency and ease of comprehension; and 3) coherence—the logical organization and smooth transitions between instructional segments. 

## 4.1.3 Results

As shown in Table 1, MAIC-Craft demonstrates superior performance across both automated metrics (3.89 overall) and human evaluation rankings. The human evaluation particularly validates MAIC-Craft's effectiveness, with consistently higher preference scores compared with iterative processing and even teacher-refined versions. Key findings are as follows. 


Table 1. MAIC-Craft Core Technology Validation Results


<table><tr><td rowspan="2">Method</td><td colspan="4">Automated Evaluation</td><td colspan="3">Human Evaluation</td></tr><tr><td>Content</td><td>Coherence</td><td>Pedagogy</td><td>Overall</td><td>Consistency</td><td>Readability</td><td>Coherence</td></tr><tr><td>Iterative processing</td><td>3.68</td><td>3.72</td><td>3.75</td><td>3.72</td><td>1.47</td><td>1.48</td><td>1.31</td></tr><tr><td>Direct prompting</td><td>3.73</td><td>3.74</td><td>3.78</td><td>3.75</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Teacher refined</td><td>-</td><td>-</td><td>-</td><td>-</td><td>2.12</td><td>2.16</td><td>2.25</td></tr><tr><td>MAIC-Craft</td><td>3.86</td><td>3.89</td><td>3.92</td><td>3.89</td><td>2.44</td><td>2.37</td><td>2.44</td></tr><tr><td>w/o visual</td><td>3.61</td><td>3.77</td><td>3.68</td><td>3.69</td><td>-</td><td>-</td><td>-</td></tr><tr><td>w/o context</td><td>3.84</td><td>3.66</td><td>3.84</td><td>3.78</td><td>-</td><td>-</td><td>-</td></tr></table>


Note: Automated scores (1–5 scale), human ranking (1–3 scale, the higher the better). “-” represents no evaluation conducted. Bold scores represent the best performances. 


- Multimodal Understanding Advantage. MAIC-Craft's comprehensive processing significantly outperforms single-modality approaches, validating our integration strategy that addresses the requirement for diverse input format handling. 

- Long-Context Coherence. Strong coherence scores in both automated (3.89) and human evaluation (2.44) demonstrate MAIC-Craft's ability to maintain narrative consistency across extended educational content, directly addressing the long-context understanding challenges identified in MAIC-Craft. 

- Pedagogical Intelligence. Superior pedagogy scores (3.92) and consistent human preference across all dimensions confirm that MAIC-Craft's structured instructional design principles effectively enhance educational content quality beyond simple content generation, supporting our human-AI collaborative framework approach. 

These results validate that the core technologies powering MAIC-Craft's generation stage possess the fundamental capabilities required for high-quality educational content creation across multiple modalities and formats. 

## 4.2 Personalization Evaluation

In this subsection, we conduct expert evaluations for the personalization effectiveness of our adaptive engine. 

## 4.2.1 Data Construction

To evaluate the personalization capability of the adaptive engine, we construct a dataset covering five university-level courses across diverse disciplines: Towards Artificial General Intelligence (TAGI, computer science), How to Study in University (HSU, education), Biology (BIO, natural science), Probability Theory and Mathematical Statistics (PTMS, mathematics), and Psychology (PSY, psychology). For each course, we extract self-contained instructional segments from validated, human-authored curricula. To simulate varied learner contexts, we generate synthetic yet realistic student profiles that reflect heterogeneous academic backgrounds and personal interests, validated against representative university enrollment distributions. The final dataset consists of 60 samples with 17 806 words and 2 573 retrieved supporting documents. 

## 4.2.2 Baselines

We benchmark our system's personalized instructional content against the original human-authored materials. To disentangle the contributions of individual components, we further implement two ablation settings: 1) system-level ablation, where the backbone model is evaluated with and without retrieval augmentation to assess the role of external grounding; 2) model-level ablation, where the backbone LLM is replaced with alternative foundation models (GPT-4o, OpenAI-o1) under identical retrieval conditions, to examine the influence of model choice on personalization quality. 

## 4.2.3 Human Evaluation

We conduct a blind expert evaluation on the constructed dataset. Five annotators with expertise in pedagogy and instructional design independently assess anonymized outputs along six pedagogical dimensions: instructional accuracy, expressive clarity, logical coherence, student engagement, linguistic naturalness, and personalization relevance. Each sample is double-coded by two reviewers, yielding high inter-rater reliability (Kendall's $\alpha \geq 0.8$ ). We aggregate the final scores in Table 2 to compare win-rates across conditions. 

## 4.2.4 Results

The results demonstrate a clear pedagogical advantage of personalization. Compared with human-authored materials, our system achieves markedly higher scores in learner-centered dimensions: personalization relevance (92.2 vs 33.8) and student engagement (87.0 vs 35.9). Notably, annotators also preferred the system's linguistic naturalness (86.0 vs 33.8), commenting that while human materials are accurate, they are often perceived as “dry” and “impersonal”, whereas the personalized outputs integrate analogies and contexts resonant with individual learners. 

Ablation settings further confirm these findings. Removing retrieval causes sharp declines in instructional accuracy $(77.8 \rightarrow 53.7)$ and expressive clarity $(75.5 \rightarrow 53.0)$ , underscoring its necessity for factual grounding and clarity. Backbone substitution reveals that model choice strongly influences affective dimensions: while alternative retrieval-augmented baselines perform reasonably, our chosen backbone consistently leads in engagement, naturalness, and relevance. 


Table 2. Expert Evaluation Across Six Pedagogical Dimensions


<table><tr><td>Method</td><td>Ablation</td><td>Acc (%)</td><td>Cla (%)</td><td>Coh (%)</td><td>Eng (%)</td><td>Nat (%)</td><td>Rel (%)</td><td>Overall (%)</td></tr><tr><td>Human-authored</td><td>-</td><td>55.5</td><td>56.5</td><td>57.9</td><td>35.9</td><td>33.8</td><td>33.8</td><td>45.5</td></tr><tr><td>Ours</td><td>-</td><td>77.8</td><td>75.5</td><td>76.2</td><td>87.0</td><td>86.0</td><td>92.2</td><td>82.4</td></tr><tr><td>w/o retrieval</td><td>System</td><td>53.7</td><td>53.0</td><td>53.4</td><td>67.3</td><td>69.0</td><td>65.7</td><td>60.3</td></tr><tr><td>GPT-4o</td><td>Model</td><td>55.9</td><td>56.8</td><td>57.2</td><td>55.8</td><td>54.1</td><td>54.8</td><td>55.9</td></tr><tr><td>OpenAI-o1</td><td>Model</td><td>57.1</td><td>58.2</td><td>55.2</td><td>54.0</td><td>57.1</td><td>53.4</td><td>55.8</td></tr></table>


Note: Acc: accuracy, Cla: clarity, Coh: coherence, Eng: engagement, Nat: naturalness, Rel: relevance. We compare our system against human-authored content and show two ablation settings: 1) system-level (w/o retrieval augmentation) and 2) model-level (LLM backbones with retrieval augmentation). Bold scores represent the best performances and the underlined ones indicate the second best performances. 


Overall, our system attains the highest score (82.4), validating the effectiveness of retrieval-augmented personalization over both standardized human materials and alternative system variants. 

## 4.3 Learning Side Evaluation

Classroom Manager Agent. Subsection 3.1.2 also mentions several relevant techniques of MAIC learning. The classroom manager agent is the keypoint of the classroom controlling. However, the evaluation of this process is highly subjective, making it challenging to establish an objective scoring system for assessment. Therefore, in the practical implementation of the TAGI and HSU courses, we select 500 actual system decisions and extract their corresponding classroom scenarios. We recruit expert teachers and teaching assistants to manually annotate these scenarios. Based on this annotated data, we derive the results shown in Fig.5. These results illustrate the alignment between the actions chosen by the manager agent and those selected by human instructors in determining the next course action. Specifically, we evaluate the implementation with and without role description, detecting the effects of contextual information. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/a297b0a4e615b0c2550233519d9752eded4ab7c9b8febfcfe43f2c423411c391.jpg)



Fig.5. Manager agent precision.


## 4.3.1 Results

Statistical analysis reveals that omitting role descriptions for each agent reduces the classifier's performance. Although the LLM can sometimes identify the correct agent by referencing partial behaviors from the chat history, the inclusion of comprehensive role descriptions markedly enhances performance. This suggests that while leveraging chat history as input for the scene controller can provide some benefits, it is insufficient for consistently generating accurate outputs. 

The current results, however, remain below optimal levels, indicating further opportunities to enhance the user experience. Despite the suboptimal performance, interacting agents demonstrate the capacity to partially offset these shortcomings. This compensatory effect is due to the LLM's ability to manage user queries beyond the predefined functions, as evidenced by our subsequent behavioral study, where user ratings do not significantly decline in the ablation setting. 

However, enhancing the accuracy of the controller agent remains advantageous as agents can more effectively manage the tasks they are designed for. For example, the teacher agent is tailored to adopt a softer, more instructive tone, but it may be less effective in handling safety-related cases compared with the assistant agent. Improved accuracy ensures that each agent operates within its designed scope, contributing to a more seamless and effective instructional process. 

## 5 Empirical Evaluation

To explore how students utilize the MAIC platform for learning and to evaluate the learning effectiveness within an authentic educational setting, a large-scale user study is conducted. Following ethical approval from the Tsinghua University Science and 

Technology Ethics Committee (Certificate No: THU-04-2024-56), we implement a two-month experimental intervention within the course Towards General Artificial Intelligence (TGAI). While over 500 students initially registered, a total of 319 students ultimately completed the course within the study period. This investigation aims to address three core research objectives: 1) to characterize student engagement patterns during course learning and human-AI interactions, and 2) to determine the learning outcomes achieved by students following the MAIC intervention, and 3) to evaluate the quality of the AI-generated instruction and interaction on the MAIC platform. Preliminary observations derived from this study are detailed in the subsequent subsections. Due to the page limitation, we report detailed results of the quality of the AI-generated instruction and interaction on the MAIC platform in the Appendix $^{®}$ . 

## 5.1 Student Engagement in MAIC

Analyzing the log data enabled us to further investigate students' engagement in the MAIC course and their interaction dynamics with the multiple AI agents. The results revealed a clear divergence in student approach: among all the students who successfully completed the entire course ( $N = 319$ ), $13.7\%$ primarily adopted an “observational mode”, while the vast majority ( $86.3\%$ ) actively engaged in interactions with the various AI agents. 

Subsequent qualitative data gathered through student interviews offered insight into these distinct approaches. Students who adopted the observational mode indicated that they were able to smoothly follow the AI instructor's explanations without cognitive interruption. They specifically reported that this approach facilitated “uninterrupted thinking” and resulted in “a more cohesive learning experience”. For students who actively chose the interactive mode, the average number of messages sent per student per module was 5.24 (SD = 6.62), with an average message length of 21.28 Chinese characters (SD = 16.94). Qualitatively, these interactive students described their experience as gaining “a supportive environment for self-expression”, where they felt “zero pressure to ask questions and receive immediate feedback from different perspectives”, highlighting the perceived benefits of the interactive setting for personal-

ized inquiry. 

To comprehensively unfold students' interaction with multiple AI agents, we systematically categorized and consolidated student activities into seven distinct activity types, which are visually represented in Fig.6. These categories include asking questions, initiating ideas, responding to AI's questions, negotiating and verifying, regulating AI roles, regulating class process, and sharing emotion. Notably, the behaviors of asking questions and initiating ideas were the most prevalent, accounting for 79% of all recorded activities. Furthermore, it is important to note that some students managed and controlled different intelligent agent roles and the class progress. These management-related behaviors account for 11% (Fig.6), for example, “Please go back to the previous slide” or “Please explain that in simpler terms”, demonstrating strong autonomy and self-regulated learning abilities. In the interviews, some students also mentioned, “I don’t just ask for knowledge; I might ask, I want to learn more, or I hope to explore something new in a certain field, to manage and regulate the AI’s responses.” 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/e3ddaf70f57961f0e23944aa996027fcaf5dfc4d9223500183349bec9802ea0c.jpg)



Fig.6. Ratios of student activities.


Overall, the high level of proactive questioning indicates that students are eager to engage when given the opportunity, underscoring the importance of designing AI tools that foster inquiry-based learning $^{[51]}$ . Questioning is an important behavior that reflects active learning in students, which ultimately leads to better academic performance. Finally, the occurrence of management-related behaviors suggests that students already realize their active role in their learning process, which align with previous study $^{[52]}$ . 

## 5.2 Learning Outcomes in MAIC

Students' learning outcomes on the MAIC courses were evaluated from three perspectives: learning performance (the baseline test, performance in module tests and final course test), technology acceptance through questionnaires, and self-reported higher-order thinking scores. 

Test Results. The baseline test was conducted one day prior to the course, consisting of 10 multiple-choice questions. Module tests were conducted at the end of each module, focusing primarily on the content covered in the module. Each module test consisted of 10 multiple-choice questions. All the test items were created by the course teacher and teaching assistants. The correlation analysis showed that test scores are strongly associated with class engagement. Specifically, the frequency (measured by the logarithm of the number of messages per module MsgNum) and length of in-class chat messages (measured by the logarithm of the number of characters per message and module MsgLen) sent by students, prominent features of the MAIC system, were positively correlated with standardized module test scores, as presented in Table 3. 


Table 3. Correlation of Students' Message-Aware Behaviors and Test Results


<table><tr><td></td><td><eq>\mu(\log(MsgNum))</eq></td><td><eq>\mu(\log(MsgLen))</eq></td></tr><tr><td>AvgQuiz</td><td>0.341***</td><td>0.202*</td></tr><tr><td>FinalExam</td><td>0.346***</td><td>0.333**</td></tr></table>


Note: Values shown in the table are normalized. 


A regression analysis on students' average module test scores was performed, controlling normalized scores of the baseline test as the covariate. As Table 4 shows, the average message length (AvgMsgLen) is found to be a significant predictor of the final exam performance ( $\beta = 0.14$ , $p = 0.021$ ). 


Table 4. Regression Results of Final Exam on the Length of Messages


<table><tr><td></td><td><eq>\beta</eq></td><td>SE</td><td>95% CI</td><td>t</td><td>p</td></tr><tr><td>(Constant)</td><td>25.46</td><td></td><td>[19.13 31.79]</td><td>8.02</td><td>&lt;0.001</td></tr><tr><td>AvgMsgLen</td><td>0.14</td><td>0.25</td><td>[0.02 0.26]</td><td>2.36</td><td>0.021</td></tr><tr><td>Baseline</td><td>2.02</td><td>0.43</td><td>[1.46 3.36]</td><td>4.05</td><td>&lt;0.001</td></tr></table>


Note: SE: standard error. CI: confidence interval. 


Technology Acceptance. We also evaluate students' attitude changes towards generative AI tools before and after the course. The results demonstrated a significant increase in technology acceptance (N = 111, t = 3.05, p = 0.002). Further analysis of specific dimensions of acceptance revealed significant improvements in habit (t = 2.81, p = 0.005), effort expectancy (t = 3.98, p < 0.001), and facilitating conditions $t = 3.22, p = 0.002$ . These findings indicate that the immersive learning experience on the MAIC platform successfully facilitates the development of a positive and constructive attitude towards the use of generative AI tools. Interview responses also reflect an enhanced understanding and acceptance of AI technologies. One student remarked: “I used to be quite resistant to AI, mainly because it was too complicated, but after this course, I found that it was not that complicated. I learned some of its principles.” 

High-Order Thinking. We explore the perceived impact of taking the TAGI course on the MAIC platform on students' higher-order thinking skills by comparing student responses from pre- and post-course questionnaires. The results of paired-sample t-tests showed significant increases in students' perceptions of the course's positive effects on both abstract thinking $t=2.32,\ p=0.02$ and critical thinking $t=2.37,\ p=0.02$ . These findings suggest that students perceived the learning experience on the MAIC platform as an enhancement to their higher-order thinking capabilities. 

Interviews further illuminated these perceptions. One student stated: “I think it might make me more confident in asking these questions and think more. I also approach problems from multiple perspectives, although I won’t completely accept what the AI says; I always think about it more.” 

Few students articulated a noticeable deficiency in opportunities for deep, substantive discussion within the course structure. For instance, one student commented on the limitations compared with a traditional setting: “(In a real classroom) After class, I can ask the teacher to explain it to me again. Teachers will directly tell me whether my question is correct, valuable, or not, based on their understanding. The teacher’s questions can challenge my ingrained cognition and help me break my own limitations, but the AI teacher and AI classmates in this course do not seem capable of doing that”. 

This student further criticized the focus of the content: “This course is purely about knowledge or concepts because the teacher’s teaching is quite mechanical. The course is rich in theoretical knowledge, but there is almost no ‘life thinking’, ‘life enlightenment’, or any philosophical reflections outside of artificial intelligence.” 

Both quantitative and qualitative observations collectively suggest that while students broadly acknowledge the MAIC platform's potential to foster abstract and critical thinking, it may not have fully facilitated the deep, challenging, and personally relevant intellectual engagement needed to promote all aspects of higher-order thought. Therefore, future work will focus on integrating more advanced cognitive strategies into the agents' design and introducing more complex problem-solving scenarios and challenging content to better support the development of higher-order thinking. 

## 6 Future Work

Building upon the foundational framework of MA-IC, several critical directions warrant further investigation to advance the integration of AI and educational theory. 

First, future work should consider developing LLMs that are not only technically proficient but also deeply grounded in established pedagogical principles and cognitive science. This entails constructing a domain-specific foundational model for education-one that internalizes curricular structures, learning progressions, knowledge states and cognitive load theory—thereby enabling the generation of learning resources that are both instructionally sound and cognitively optimized. Specifically, course plans generated by MAIC-Craft could be more well-aligned with pedagogical principles, with less hallucinations and more Socratic educational practice designs. It would serve as a unified and an education-centric knowledge base, ensuring fidelity to learning objectives while supporting adaptive content delivery. 

Second, there are also sufficient needs about enriching collaborative learning environments through more sophisticated multi-agent simulations. Specifically, we will extend MAIC to support dynamic team interactions with different roles in project-based learning, where AI agents not only build task execution, but also model metacognitive strategies, social regulation, and epistemic discourse. It requires advancing human-centered agent design, where agents act not merely as tools, but also as responsive, socially aware collaborators that adapt to the evolving needs, group dynamics, and affective states of learners. 

Third, from a pedagogical perspective, we plan to continually investigate the co-learning trajectories and outcomes in a multi-agent classroom as well as the abovementioned MAIC-PBL. Meanwhile, with the expanding breadth of courses and topics, learning objectives steadily increase, where we aim to analyze the learning style and outcomes of students in solving complex problem or projects. 

Finally, a long-term vision involves aligning AI more closely with biological and human intelligence. It includes exploring brain-inspired architectures that mirror human memory, attention, and reasoning processes, and leveraging such insights to design multi-agent systems with fine-grained cognitive fidelity. Building human-like agents at a behavioral level, we aspire to create AI-augmented classrooms that do not just simulate teaching, but also authentically emulate the nuanced, empathetic, and adaptive nature of human instruction. 

## 7 Predicted Impact

The implementation of MAIC in online education is expected to revolutionize the learning experience by enhancing both scalability and adaptability. By leveraging multi-agent systems, MAIC can dynamically adjust to the needs of individual learners, providing personalized learning paths that were previously unattainable in traditional MOOCs. This personalized approach not only improves learning outcomes but also provides access to high-quality education across diverse socio-economic backgrounds, as it reduces the dependency on human instructors for content delivery. 

Moreover, MAIC is anticipated to address some of the inherent challenges of traditional online education, such as the one-size-fits-all model and the lack of real-time adaptability $^{[53]}$ . The integration of AI-driven agents as teachers, teaching assistants, and classmates creates a more interactive and responsive learning environment. This shift promises to increase engagement and motivation among students, potentially leading to higher completion rates and deeper understanding of the material. 

However, it is crucial to acknowledge that the introduction of such a transformative system could also have unintended consequences. There may be a widening gap between students who adapt well to AI-powered learning environments and those who struggle with this new mode of education. Additionally, the reliance on AI systems could lead to reduced opportunities for human instructors, potentially diminishing the role of educators in the learning process. These impacts need to be carefully monitored and addressed through ongoing evaluation and refinement of the MAIC system. 

## 8 Conclusions

In this paper, we provided a concise overview of the development trajectory of online education and technological opportunities that arise in the era of large language models (LLMs). Considering the principles of adaptivity and scalability, along with the sophisticated design of LLM-driven multi-agent systems, we explored how existing MOOC can be transformed into MAIC (Massive AI-Empowered Courses) and discussed new paradigms of teaching and learning. We proposed a comprehensive solution, analyzed key technical components, and implemented each step of the process. Our approaches are practically deployed in several courses at Tsinghua University, Beijing, leading to a series of preliminary observations of student behavior. These initial findings suggest that highly personalized classrooms built with new AI-assisted learning technologies can achieve high quality, and student behaviors demonstrate the effectiveness of the teaching process. 

Acknowledgements We give the greatest appreciation to Yisi Zhan for practicing her course “How to Study in the University” on MAIC. We sincerely thank Jie Cao, Ruimiao Li, Letian Ma, Jiaxin Fan, Yang Dang, Yongqi Li, and Zhaochun Wen for their full and committed support for educational data collections and analysis. We thank Yuanchun Wang, Hanming Li for toolkit development. We thank Nan Zhang, Ruixin Ni, Zehang Li, Yuqiu Liu, Yanpeng Wang, and Danqi Zheng for their outstanding project management, coordination, engineering implementation, and product design. 

Conflict of Interest The authors declare that they have no conflict of interest. 

## References



[1] Ng A. The online revolution: Education for everyone. In Proc. the 22nd ACM International Conference on Information & Knowledge Management, Oct. 27–Nov. 1, 2013, pp.1913–1914. DOI: 10.1145/2505515.2514698. 





[2] Fröbel F. The Education of Man. D. Appleton and Company, 1887. 





[3] Halstead M, Taylor M J. Values in Education and Education in Values. Routledge, 2005. DOI: 10.4324/9780203973554. 





[4] Daniel J. Making sense of MOOCs: Musings in a maze of myth, paradox and possibility. Journal of Interactive Media in Education, 2012, 2012(3): Article No. 18. DOI: 10.5334/2012-18. 





[5] Pappano L. The year of the MOOC. The New York Times, 2012, 2(12): 2012. 





[6] Papadakis S. MOOCs 2012-2022: An overview. Advances in Mobile Learning Educational Research, 2023, 3(1): 682-693. DOI: 10.25082/AMLER.2023.01.017. 





[7] Reich J, Ruipérez-Valiente J A. The MOOC pivot. Science, 2019, 363(6423): 130–131. DOI: 10.1126/science.aav7958. 





[8] Reich J. Rebooting MOOC research. Science, 2015, 347(6217): 34–35. DOI: 10.1126/science.1261627. 





[9] Zhu M, Sari A R, Lee M M. A comprehensive systematic review of MOOC research: Research techniques, topics, and trends from 2009 to 2019. Educational Technology Research and Development, 2020, 68(4): 1685–1710. DOI: 10.1007/s11423-020-09798-x. 





[10] Nabizadeh A H, Leal J P, Rafsanjani H N, Shah R R. Learning path personalization and recommendation methods: A survey of the state-of-the-art. Expert Systems with Applications, 2020, 159: 113596. DOI: 10.1016/j.eswa.2020.113596. 





[11] Zhong Q, Yu J, Zhang Z, Mao Y, Wang Y, Lin Y, Hou L, Li J, Tang J. Towards a general pre-training framework for adaptive learning in MOOCs. arXiv: 2208.04708, 2022. https://arxiv.org/abs/2208.04708, Feb. 2026. 





[12] Jiang W, Pardos Z A, Wei Q. Goal-based course recommendation. In Proc. the 9th International Conference on Learning Analytics & Knowledge, Mar. 2019, pp.36–45. DOI: 10.1145/3303772.3303814. 





[13] Zhang H, Huang T, Lv Z, Liu S, Zhou Z. MCRS: A course recommendation system for MOOCs. Multimedia Tools and Applications, 2018, 77(6): 7051–7069. DOI: 10.1007/s11042-017-4620-2. 





[14] Jing X, Tang J. Guess you like: Course recommendation in MOOCs. In Proc. the International Conference on Web Intelligence, Aug. 2017, pp.783–789. DOI: 10.1145/3106426.3106478. 





[15] Yilmaz R, Yurdugül H, Yilmaz F G K, Şahin M, Sulak S, Aydin F, Tepgeç M, Müftüoğlu C T, Oral Ö. Smart MOOC integrated with intelligent tutoring: A system architecture and framework model proposal. Computers and Education: Artificial Intelligence, 2022, 3: 100092. DOI: 10.1016/j.caeai.2022.100092. 





[16] Tu S, Zhang Z, Yu J, Li C, Zhang S, Yao Z, Hou L, Li J. LittleMu: Deploying an online virtual teaching assistant via heterogeneous sources integration and chain of teach prompts. In Proc. the 32nd ACM International Conference on Information and Knowledge Management, Oct. 2023, pp.4843–4849. DOI: 10.1145/3583780.3615484. 





[17] Kabudi T, Pappas I, Olsen D H. AI-enabled adaptive learning systems: A systematic mapping of the literature. Computers and Education: Artificial Intelligence, 2021, 2: 100017. DOI: 10.1016/j.caeai.2021.100017. 





[18] Epstein Z, Hertzmann A, The Investigators of Human Creativity. Art and the science of generative AI. Science, 2023, 380(6650): 1110–1111. DOI: 10.1126/science.adh4451. 





[19] OpenAI. GPT-4 technical report. arXiv: 2303.08774, 2023. https://arxiv.org/abs/2303.08774, Feb. 2026. 





[20] Touvron H, Lavril T, Izacard G, Martinet X, Lachaux M A, Lacroix T, Rozière B, Goyal N, Hambro E, Azhar F, Rodriguez A, Joulin A, Grave E, Lample G. LLaMA: Open and efficient foundation language models. arXiv: 2302.13971, 2023. https://arxiv.org/abs/2302.13971, Feb. 2026. 





[21] Chen W, Su Y, Zuo J, Yang C, Yuan C, Qian C, Chan C M, Qin Y, Lu Y, Xie R, Liu Z, Sun M, Zhou J. Agent-Verse: Facilitating multi-agent collaboration and exploring emergent behaviors in agents. arXiv: 2308.10848v1, 2023. https://arxiv.org/abs/2308.10848v1, Feb. 2026. 





[22] Wu Q, Bansal G, Zhang J, Wu Y, Zhang S, Zhu E, Li B, Jiang L, Zhang X, Wang C. AutoGen: Enabling next-gen LLM applications via multi-agent conversation framework. arXiv: 2308.08155v1, 2023. https://arxiv.org/abs/2308.08155v1, Feb. 2026. 





[23] Park J S, O'Brien J, Cai C J, Morris M R, Liang P, Bernstein M S. Generative agents: Interactive simulacra of human behavior. In Proc. the 36th Annual ACM Symposium on User Interface Software and Technology, Oct. 29–Nov. 1, 2023, Article No. 2. DOI: 10.1145/3586183.3606763. 





[24] Qian C, Cong X, Liu, Yang C, Chen W, Su Y, Dang Y, Li J, Xu J, Li D, Liu Z, Sun M. Communicative agents for software development. arXiv: 2307.07924v4, 2023. https://arxiv.org/abs/2307.07924v4, Feb. 2026. 





[25] Yu J, Wang Y, Zhong Q, Luo G, Mao Y, Sun K, Feng W, Xu W, Cao S, Zeng K, Yao Z, Hou L, Lin Y, Li P, Zhou J, Xu B, Li J, Tang J, Sun M. MOOCCubeX: A large knowledge-centered repository for adaptive learning in MOOCs. In Proc. the 30th ACM International Conference on Information & Knowledge Management, Nov. 2021, pp.4643–4652. DOI: 10.1145/3459637.3482010. 





[26] Pal Chowdhury S, Zouhar V, Sachan M. AutoTutor meets large language models: A language model tutor with rich pedagogy and guardrails. In Proc. the 11th ACM Conference on Learning @ Scale, Jul. 2024, pp.5–15. DOI: 10.1145/3657604.3662041. 





[27] Nwana H S. Intelligent tutoring systems: An overview. Artificial Intelligence Review, 1990, 4(4): 251–277. DOI: 10.1007/BF00168958. 





[28] Hexter J H. The education of the aristocracy in the renaissance. The Journal of Modern History, 1950, 22(1): 1–20. DOI: 10.1086/237314. 





[29] Giroux H A, Penna A N. Social education in the classroom: The dynamics of the hidden curriculum. Theory & Research in Social Education, 1979, 7(1): 21–42. DOI: 10.1080/00933104.1979.10506048. 





[30] Dang F, Tang J, Li S. MOOC-KG: A MOOC knowledge graph for cross-platform online learning resources. In 





Proc. the 9th International Conference on Electronics Information and Emergency Communication (ICEIEC), Jul. 2019. DOI: 10.1109/ICEIEC.2019.8784572. 





[31] Brockfeld T, Müller B, de Laffolie J. Video versus live lecture courses: A comparative evaluation of lecture types and results. Medical Education Online, 2018, 23(1): 1555434. DOI: 10.1080/10872981.2018.1555434. 





[32] Mislevy R J, Gitomer D H. The role of probability-based inference in an intelligent tutoring system. User Modeling and User-Adapted Interaction, 1995, 5(3/4): 253–282. DOI: 10.1007/BF01126112. 





[33] Aleven V. Rule-based cognitive modeling for intelligent tutoring systems. In Advances in Intelligent Tutoring Systems, Nkambou R, Bourdeau J, Mizoguchi R (eds.), Springer-Verlag, 2010, pp.33–62. DOI: 10.1007/978-3-642-14363-2_3. 





[34] Cui W, Xiao Y, Wang H, Song Y, Hwang S W, Wang W. KBQA: Learning question answering over QA corpora and knowledge bases. Proceedings of the VLDB Endowment, 2017, 10(5): 565–576. DOI: 10.14778/3055540.3055549. 





[35] Carey T A, Mullan R J. What is Socratic questioning? Psychotherapy: Theory, Research, Practice, Training, 2004, 41(3): 217–226. DOI: 10.1037/0033-3204.41.3.217. 





[36] Nye B D, Graesser A C, Hu X. AutoTutor and family: A review of 17 years of natural language tutoring. International Journal of Artificial Intelligence in Education, 2014, 24(4): 427–469. DOI: 10.1007/s40593-014-0029-5. 





[37] Schultz K, Bratt E O, Clark B, Peters S, Pon-Barry H, Treeratpituk P. A scalable, reusable spoken conversational tutor: SCoT. In Proc. the AIED 2003 Workshop on Tutorial Dialogue Systems: With a View Toward the Classroom, Jul. 2003, pp.367–377. 





[38] Jiang L, Hu S, Huang M, Wang Z, Yang J, Ye X, Zheng W. MAssistant: A personal knowledge assistant for MOOC learners. In Proc. the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP): System Demonstrations, Nov. 2019, pp.133–138. DOI: 10.18653/v1/D19-3023. 





[39] Meijer R R, Nering M L. Computerized adaptive testing: Overview and introduction. Applied Psychological Measurement, 1999, 23(3): 187–194. DOI: 10.1177/01466219922031310. 





[40] Piech C, Bassen J, Huang J, Ganguli S, Sahami M, Guibas L, Sohl-Dickstein J. Deep knowledge tracing. In Proc. the 29th International Conference on Neural Information Processing Systems, Dec. 2015, pp.505–513. DOI:10.5555/2969239.2969296. 





[41] Wang F, Liu Q, Chen E, Huang Z, Chen Y, Yin Y, Huang Z, Wang S. Neural cognitive diagnosis for intelligent education systems. In Proc. the AAAI Conference on Artificial Intelligence, Feb. 2020, pp.6153–6161. DOI: 10.1609/aaai.v34i04.6080. 





[42] Dan Y, Lei Z, Gu Y, Li Y, Yin J, Lin J, Ye L, Tie Z, Zhou Y, Wang Y, Zhou A, Zhou Z, Chen Q, Zhou J, He 





L, Qiu X. EduChat: A large-scale language model-based chatbot system for intelligent education. arXiv:2308.02773, 2023. https://arxiv.org/abs/2308.02773, Feb. 2026. 





[43] Li H, Yu J, Ouyang Y, Liu Z, Rong W, Liu H, Li J, Xiong Z. Explainable few-shot knowledge tracing. Frontiers of Digital Education, 2025, 2(4): Article No. 34. DOI: 10.1007/s44366-025-0071-x. 





[44] Zhang Z, Zhang-Li D, Yu J, Gong L, Zhou J, Hao Z, Jiang J, Cao J, Liu H, Liu Z, Hou L, Li J. Simulating classroom education with LLM-empowered agents. In Proc. the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies, Apr. 2025, pp.10364–10379. DOI: 10.18653/v1/2025.naacl-long.520. 





[45] Schwanke D. Classroom interaction research: A survey of recent literature. The Journal of Classroom Interaction, 1981, 16(2): 8–10. 





[46] Hong S, Zheng X, Chen J, Cheng Y, Wang J, Zhang C, Wang Z, Yau S K S, Lin Z, Zhou L, Ran C, Xiao L, Wu C. MetaGPT: Meta programming for multi-agent collaborative framework. arXiv: 2308.00352v4, 2023. https://arxiv.org/abs/2308.00352v4. Feb. 2026. 





[47] Hu S, Tu Y, Han X, He C, Cui G, Long X, Zheng Z, Fang Y, Huang Y, Zhao W, Zhang X, Thai Z, Zhang K, Wang C, Yao Y, Zhao C, Zhou J, Cai J, Zhai Z, Ding N, Jia C, Zeng G, Li D, Liu Z, Sun M. MiniCPM: Unveiling the potential of small language models with scalable training strategies. arXiv: 2404.06395, 2024. https://arxiv.org/abs/2404.06395, Feb. 2026. 





[48] Team GLM. ChatGLM: A family of large language models from GLM-130B to GLM-4 all tools. arXiv: 2406.12793, 2024. https://arxiv.org/abs/2406.12793, Feb. 2026. 





[49] Kurdi G, Leo J, Parsia B, Sattler U, Al-Emari S. A systematic review of automatic question generation for educational purposes. International Journal of Artificial Intelligence in Education, 2020, 30(1): 121–204. DOI: 10.1007/s40593-019-00186-y. 





[50] Garrison D R, Arbaugh J B. Researching the community of inquiry framework: Review, issues, and future directions. The Internet and Higher Education, 2007, 10(3):157–172. DOI: 10.1016/j.iheduc.2007.04.001. 





[51] Xie X. Influence of AI-driven inquiry teaching on learning outcomes. International Journal of Emerging Technologies in Learning (iJET), 2023, 18(23): 59–70. DOI: 10.3991/ijet.v18i23.45473. 





[52] Cain W. Prompting change: Exploring prompt engineering in large language model AI and its potential to transform education. TechTrends, 2024, 68(1): 47–57. DOI: 10.1007/s11528-023-00896-0. 





[53] Rizvi S, Rienties B, Rogaten J, Kizilcec R F. Beyond one-size-fits-all in MOOCs: Variation in learning design and persistence of learners in different cultural and socioeconomic contexts. Computers in Human Behavior, 2022, 126: 106973. DOI: 10.1016/j.chb.2021.106973. 



![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/4ad7eb406b66f47c9573947d1d508faaff4ea466e0190a1d22339edb7d72185b.jpg)



Ji-Fan Yu received his B.E. degree in software engineering from Beihang University, Beijing, in 2018, and his Ph.D. degree in computer science and technology from Tsinghua University, Beijing, in 2024. He currently works at Tsinghua University's School of Edu-


cation, where his research is on artificial intelligence in education. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/8d804415ce2f838ef3897cf1a5ba795d2ed8ae6609d8f5b36b3dcc5debbc1723.jpg)


Daniel Zhang-Li received his B.E. and M.S. degrees in computer science and technology from Tsinghua University, Beijing, in 2021 and 2023, respectively. He is currently a Ph.D. candidate in computer science and technology at Tsinghua University. His re-

search interest lies in large language models and application agents. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/520a0501599eb5d37a45c17103f0f6ce63920e7c7ef490b9a9273156079c2f1f.jpg)


Zhe-Yuan Zhang received his LLB degree in philosophy, politics, and economy, and his M.S. degree in computer science and technology from Tsinghua University, Beijing, in 2022 and 2025, respectively. He is currently a Ph.D. student at Carnegie Mellon Uni-

versity, Pittsburgh. His research focuses on human-agent interaction. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/c9da2e3efb743924e0153ded6d5d2293a12369975a6b9004644a221407103d46.jpg)


Yu-Cheng Wang received his B.E. degree in computer science from Zhejiang University, Hangzhou, in 2020. He is currently a master student in the Knowledge Engineering Group at Tsinghua University's Department of Computer Science and Technology, 

Beijing. His research focuses on artificial intelligence in education. 

search focuses on large language models and their applications in education. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/80493ac3099400cd7afd6a21023931486ba71d3f3ab9ae7424483e815d0c9ec4.jpg)



Hao-Xuan Li received his B.E. and M.S. degrees at the School of Computer Science and Technology from Beihang University, Beijing, in 2022 and 2025, respectively. He is currently a first-year Ph.D. candidate at the College of AI, Tsinghua University, Bei-



jing. His research focuses on cognitive science and AI for education.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/133f9300515ef23841977230c73937f95140edd571dd931cf8230c5f8d305b3f.jpg)


Joy Jia Yin Lim received her B.E. degree in computer science and technology from Tsinghua University, Beijing, in 2023. She is currently a master student at the Department of Computer Science and Technology, Tsinghua University, Beijing. Her re-

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/c5efdcd3b2f502c26a2638dc3235fd3df80562fd7197e8d6dc026f7f1c4b6a97.jpg)


Zhan-Xin Hao received her B.Ed. degree in education from Beijing Normal University, Beijing, her M.A degree in educational assessment from University College London, London, and her Ph.D. degree in educational assessment from the University of Ox-

ford, Oxford. She is currently a postdoctoral fellow at Tsinghua University's School of Education, where her research focuses on artificial intelligence in education. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/8e899fa890b526cb2ef8dead0832dd72435ca073edc76d8a1e27a04dc5151b8a.jpg)


Shang-Qing Tu received his B.E. degree in computer science and technology from Beihang University, Beijing, in 2022. He is currently a Ph.D. student at the Department of Computer Science and Technology, Tsinghua University, Beijing. His re-

search focuses on large language models and their applications in education. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/63d3089b6a32b24b03ed1fac927be2e320f6f392e6142994292378878689868e.jpg)


Lu Zhang received her B.S. degree in geophysics from Tongji University, Shanghai, in 2021. She is currently a master student at the School of Education, Tsinghua University, Beijing. Her research interests focus on the practical applications of generative ar-


tificial intelligence in teaching and learning, with a particular emphasis on AI-enabled innovative pedagogical models and their implications for AI in education.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/2da9890f8fdf41a86556583f42d4ace2b039699879b9dbfeebdba6ca6fa0ab32.jpg)


Xu-Sheng Dai received his B.S. degree in economics from the University of New South Whale, Sydney, in 2023. He is currently a master student at the School of Education, Tsinghua University, Beijing. His research interests focus on paradigmatic innovation 

of pedagogy leveraged by generative artificial intelligence. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/e01af072813feea1e218b5927a1253428a6d613d7c7a8d9187fc10aa2397d1ce.jpg)


Jian-Xiao Jiang received his B.E. degree in computer science and technology from the Department of Computer Science and Technology, Tsinghua University, Beijing, in 2023. He is currently a master student at the School of Education, Tsinghua Univer-

sity, Beijing. His research leverages educational data mining and generative AI to rigorously evaluate and advance AIED innovations. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/9c8c75318db7c29e395f8a2f51de76c8ed73dc4dc4b6425c30e910b9f1cc1f9f.jpg)


Shen Yang is currently a senior undergraduate student at the Department of Computer Science and Technology, Tsinghua University, Beijing. His research focuses on the application of large language models and agents in education. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/3577c8e868431fa428990cd82504e51655a06de656c74f9ae6512173543f82b1.jpg)


Fei Qin received her Ph.D. degree in educational economics and management from the School of Education, Tsinghua University, Beijing, and is currently a postdoctoral fellow at the School of Education, Tsinghua University, Beijing. Her research interests fo-

cus on AI-empowered education and student agency development. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/96e260e0a11a401c9a268df457b31162abc0c64d189b781edbf6a61bab7ca85e.jpg)


Ze-Kun Li received his B.E. degree in data science and big data technology from Chongqing University, Chongqing, in 2025. He is currently a master student at the School of Education, Tsinghua University, Beijing. His research focuses on artificial intelli-

gence in education, large language models, and multi-agent systems. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/9da4d9f33b3ca36829450266a673b32111050df1f02be7c6de4db4b104ee2055.jpg)


Bing-Lin Liu is currently a junior undergraduate student at the Department of Computer Science and Technology, Tsinghua University, Beijing. His research focuses on human-agent interaction. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/71c6002c215327a9afb5fc99edbe6a5c9a53872e604a0ff740a817d55dacc1d9.jpg)


Xin Cong is an assistant professor at the Department of Statistics and Data Science, Tsinghua University. He received his Ph.D. degree from Chinese Academy of Sciences, Beijing, in 2023. His research interests include large language models, autonomous 

agent, and intelligent data analysis. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/7539024aaad75906f7c3887b457f80b6277c92332691cb85273fc28504879636.jpg)


Bin Xu is a professor at the Department of Computer Science and Technology, Tsinghua University, Beijing. He received his Ph.D. degree at Tsinghua University, Beijing, in 2006. He is also a distinguished member of CCF and honorary chair of CCF tech-

nical committee of computer applications. He is working on exciting areas of artificial intelligence. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/da489376960ee824e84b147d14272570d9c30f1fed0ada0ee481b76ee84f2cf7.jpg)



Lei Hou is a research associate at the Department of Computer Science and Technology, Tsinghua University, Beijing. He received his Ph.D. degree in computer science and technology from Tsinghua University, Beijing, in 2016. His research interests include



knowledge graph construction and applications and large language models.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/b5fe1fb98f550cecc4f8e092a14ad6bbbf0408b2d1b205da894442260446f27e.jpg)


Man-Li Li is a professor at the School of Education, Tsinghua University, Beijing. She received her Ph.D. degree in education from Peking University, Beijing, in 1998. She currently serves as the chair of the Academic Committee of the School of Education, 

Tsinghua University, Beijing. Her research interests include higher education, engineering education, K-12 school reform, online education, and educational equity. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/5102e86263ba8aca092c2307d99ddc11ddad726ed0613eeae602f84d255c28c3.jpg)


Juan-Zi Li is a professor at the Department of Computer Science and Technology, Tsinghua University, Beijing. She received her Ph.D. degree in computer science and technology from Tsinghua University, Beijing, in 2000. She currently serves as the director of 

the Knowledge Intelligence Center at the Institute for Artificial Intelligence, Tsinghua University, Beijing. Her research interests include knowledge graphs and social network mining. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/2b22f9602eee7513e90da06a40fd847ea829ac1b37d1631a11fe2ea1ed8af956.jpg)


Hui-Qin Liu is a research fellow at the School of Education, Tsinghua University, Beijing. She received her Ph.D. degree in management from Tsinghua University, Beijing, in 2006. She currently serves as the director of the Tsinghua University Engineering 

Education Research Center, Beijing. Her research interests include higher education policy and management, graduate education, engineering education, and future education and learning. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/d1f85468c5608131049e1d8374baedda9f72386ecc4defd58711b700608b759d.jpg)



Yu Zhang is a professor at the School of Education, Tsinghua University, Beijing. She received her Ph.D. degree in economics and education from Teachers College, Columbia University, New York, in 2011. She currently serves as Party Secretary of the


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/fc32bede9670e9ef246da96e6521eefeddcde698fa8b66890a211eb3a70424c0.jpg)


Mao-Song Sun is a professor at the Department of Computer Science and Technology, Tsinghua University, Beijing. He received his Ph.D. degree in computational linguistics from City University of Hong Kong, Hong Kong, in 2004. He currently serves as Execu-


School of Education, Tsinghua University, and Program Chair of the “Brain, Neuroscience and Education” of the American Educational Research Association. Her research interests include economics of education, quantitative evaluation of education policy innovation, and interdisciplinary education measurement integrating cognitive neuroscience and machine learning.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-09-19/de0804dd-992c-4de5-a423-6d46edc9ffae/fdd228627325e543682103c848a1af69b4f7e04a179ca82df273a2798933b4a4.jpg)


Zhi-Yuan Liu is a professor at the Department of Computer Science and Technology, Tsinghua University, Beijing. He received his Ph.D. degree in computer science from Tsinghua University, Beijing, in 2011. His research interests include knowledge graphs 

and semantic computing, and social computing and computational social science. 

tive Deputy Director of the Institute for Artificial Intelligence, Tsinghua University, Beijing, Chair of the Computer Science degree evaluation subcommittee at Tsinghua University, Beijing, and Director of the Tsinghua University Center for Large-Scale Online Education Research, Beijing. His research interests include natural language processing, large language models, Chinese information processing, and social computing. 