/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChapterJson, PyqBankJson } from "./types";

export const DEMO_CHAPTER_POLITY: ChapterJson = {
  schemaVersion: "1.0",
  type: "chapter",
  metadata: {
    id: "polity-president",
    app: "CSEGuide",
    book: "Indian Polity",
    author: "M Laxmikanth",
    edition: "8th",
    subject: "Polity and Governance",
    paper: "GS-II",
    chapterNumber: 18,
    chapterTitle: "President of India",
    part: "Part III: Central Government",
    pageStart: 276,
    pageEnd: 300,
    tags: ["President", "Union Executive", "Articles 52-78", "Electoral College"]
  },
  sections: [
    {
      id: "sec-001",
      title: "Constitutional Position and Executive Power",
      level: 2,
      pageHint: "276",
      sourceText: "Article 52 of the Indian Constitution states that there shall be a President of India. Under Article 53, the executive power of the Union shall be vested in the President and shall be exercised by him either directly or through officers subordinate to him in accordance with this Constitution. The President is the head of the Indian State. He is the first citizen of India and acts as the symbol of unity, integrity, and solidarity of the nation. In the Indian parliamentary system of government, the President is only a nominal executive head (de jure executive), while the real executive powers are vested in the Council of Ministers headed by the Prime Minister (de facto executive). Thus, the President exercises his powers in accordance with the advice tendered by the Council of Ministers.",
      footnotes: [
        "See Article 74(1) which makes it mandatory for the President to act on the advice of the cabinet."
      ],
      assistant: {
        simpleExplanation: "In simple words, India has a parliamentary form of government. This means we have two heads: a ceremonial head of state (the President) and an actual political leader (the Prime Minister). The President performs official, symbolic, and constitutional duties but must do so based on the decisions made by the PM's Cabinet.",
        prelimsLens: "Focus on Art. 52 and Art. 53. Remember that the term 'officers subordinate to him' includes ministers. Also, know that the President is de jure (legal/nominal) executive whereas the PM is the de facto (real) executive.",
        mainsLens: "Critical examination of the 'nominal executive' structure. Discuss how the 42nd and 44th Amendment Acts redefined the binding nature of Council of Ministers' advice. Important constitutional cases: UNR Rao v. Indira Gandhi (1971), Samsher Singh v. State of Punjab (1974).",
        trapAlerts: [
          "TRAP: The Constitution says 'executive power of the Union is vested in the Prime Minister'. FALSE - It is vested in the President.",
          "TRAP: The President can act independently in matters of high national emergency without Cabinet advice. FALSE - Under the 44th Amendment, even a National Emergency declaration requires written recommendation of the Cabinet."
        ],
        socraticPrompts: [
          "Why did the makers of the Indian Constitution prefer a parliamentary executive over a presidential executive like in the USA?",
          "Can the President run the administration of India for a single day without a Council of Ministers?"
        ]
      }
    },
    {
      id: "sec-002",
      title: "Election of the President (Electoral College)",
      level: 2,
      pageHint: "277-278",
      sourceText: "The President is elected not directly by the people but by members of an electoral college (Article 54). This electoral college consists of:\n1. The elected members of both Houses of Parliament (Lok Sabha & Rajya Sabha);\n2. The elected members of the legislative assemblies of the states (MLAs);\n3. The elected members of the legislative assemblies of the Union Territories of Delhi, Pudukkottai/Puducherry, and Jammu & Kashmir.\n\nThus, the nominated members of both Houses of Parliament, the nominated members of the state legislative assemblies, the members (both elected and nominated) of the state legislative councils (in case of a bicameral legislature) and any nominated members of the Union Territories legislative assemblies DO NOT participate in the election of the President. Furthermore, when an assembly is dissolved, the dissolved members cease to be qualified to vote in the presidential election, even if the fresh election to the assembly is not held before the presidential election.",
      assistant: {
        simpleExplanation: "The President's election is indirect. Citizens do not directly vote. Instead, our elected agents (MPs in Parliament and MLAs in State Assemblies) vote on our behalf. Critically, ONLY elected representatives vote—nominated members and MLCs (Legislative Council members) are strictly excluded.",
        prelimsLens: "Who votes: Elected MPs + Elected MLAs (including Delhi & Puducherry). Who DOES NOT vote: Nominated MPs, Nominated MLAs, MLCs (whether elected or nominated). What if a state assembly is dissolved? Its MLAs cannot vote, even if elections are pending.",
        mainsLens: "Discuss the reasons behind the indirect election of the President of India. Examine if the exclusion of legislative councils and nominated elements weakens the federal matrix of the President's mandate.",
        trapAlerts: [
          "TRAP: Nominated members of Parliament can vote in the election of the President, but not in impeachment. FALSE - Exactly the opposite! Nominated MPs cannot vote in elections, but they CAN vote in impeachment.",
          "TRAP: Members of Legislative Councils (MLCs) can vote for the President. FALSE - MLCs cannot vote under any circumstances."
        ],
        socraticPrompts: [
          "Why did the Constitution exclude nominated members from voting for the President?",
          "If a state assembly is dissolved just before the Presidential election, why is it constitutional to proceed with the election anyway?"
        ]
      }
    },
    {
      id: "sec-003",
      title: "System of Proportional Representation",
      level: 2,
      pageHint: "278-279",
      sourceText: "The Constitution provides that there shall be uniformity in the scale of representation of different states as well as parity between the states as a whole and the Union. To achieve this, the number of votes which each elected member of the legislative assembly of each state and Parliament is entitled to cast is determined as follows:\n\nValue of MLA Vote = (Total population of State / Total number of elected members in the State Legislative Assembly) * (1 / 1000)\n\nValue of MP Vote = (Total value of votes of all MLAs of all States / Total number of elected members of Parliament)\n\nThe President's election is held in accordance with the system of proportional representation by means of the single transferable vote and voting is by secret ballot. In this system, to win, a candidate must secure a predetermined quota of votes:\n\nElectoral Quota = [Total number of valid votes polled / (1 + 1)] + 1 = [Total valid votes / 2] + 1\n\nEach voter casts one vote but marks preferences (1st, 2nd, 3rd, etc.) for candidates.",
      assistant: {
        simpleExplanation: "This formula ensures that larger states get proportional weightage based on population, and the Union (MPs) has equal voting power to all States combined (MLAs). Voters rate candidates in order of preference. If a candidate doesn't get 50%+1 of first-preference votes, the lowest candidate is eliminated, and their second preferences are transferred.",
        prelimsLens: "Formula components: The 'population' of a state refers to the 1971 census (secured by the 84th amendment until 2026). Know the difference between MLA vote values (which vary by state population, e.g., UP is high, Sikkim is low) and MP vote values (which are uniform across all MPs).",
        mainsLens: "Analyze how the proportional representation formula balances the absolute voting weight of highly populated northern states against southern states that successfully implemented family planning, justifying the freezing of the 1971 census population data.",
        trapAlerts: [
          "TRAP: The vote value of every Rajya Sabha MP is greater than a Lok Sabha MP. FALSE - All MPs (LS and RS) have the exact same vote value.",
          "TRAP: Proportional representation makes sure the winning candidate gets a simple majority of votes. FALSE - They must get an absolute majority or a specific Electoral Quota (more than 50% of the total votes)."
        ],
        socraticPrompts: [
          "Why is the 1971 census still used for calculating voting value instead of the latest census?",
          "How does the 'secret ballot' impact political party whips during a Presidential election?"
        ]
      }
    }
  ],
  lessonMode: {
    lessons: [
      {
        id: "lesson-president-basic",
        title: "Introduction to the Indian Head of State",
        slides: [
          {
            id: "slide-001",
            type: "concept",
            title: "The Constitutional Figurehead",
            content: "• Article 52 states there shall be a President.\n• Real power lies with Council of Ministers (Cabinet) headed by PM (Art. 74).\n• President represents the State (De Jure); PM represents the Government (De Facto).",
            linkedSectionIds: ["sec-001"]
          },
          {
            id: "slide-002",
            type: "comparison",
            title: "Parliamentary vs. Presidential",
            content: "• US President: Real executive head, independent of legislature.\n• Indian President: Ceremonial executive head, bound by ministerial advice (Article 74).\n• This avoids executive-legislative conflicts in India's highly diverse polity.",
            linkedSectionIds: ["sec-001"]
          }
        ]
      },
      {
        id: "lesson-president-election",
        title: "Electoral Math and Exclusions",
        slides: [
          {
            id: "slide-003",
            type: "trap",
            title: "The Impeachment vs Election Vote Trap",
            content: "Who participates?\n• ELECTION: Nominated MPs absolutely CANNOT vote. Dissolved Assembly MLAs cannot vote.\n• IMPEACHMENT: Nominated MPs CAN vote! State Legislative Assemblies do NOT participate at all.",
            linkedSectionIds: ["sec-002"]
          },
          {
            id: "slide-004",
            type: "revision",
            title: "Formula Recap",
            content: "• MLA vote value = Population / (MLAs * 1000)\n• Population is frozen at 1971 levels (84th Amendment).\n• MP vote value = Total State MLA vote value / Total Elected MPs.",
            linkedSectionIds: ["sec-003"]
          }
        ]
      }
    ]
  },
  practice: {
    mcqs: [
      {
        id: "mcq-pres-001",
        question: "With reference to the election of the President of India, consider the following statements:\n1. The value of the vote of each MLA varies from State to State.\n2. The value of the vote of MPs of the Lok Sabha is more than the value of the vote of MPs of the Rajya Sabha.\n\nWhich of the statements given above is/are correct?",
        options: [
          "1 only",
          "2 only",
          "Both 1 and 2",
          "Neither 1 nor 2"
        ],
        answer: "A",
        explanation: "Statement 1 is correct: The value of an MLA's vote is decided by dividing the state's population by the total number of elected members of the state assembly, and then multiplying by 1/1000. Hence, it varies based on a state's population. Value of UP MLA vote is 208, while Sikkim is 7.\nStatement 2 is incorrect: The formula for an MP's vote value is (Total value of MLA votes of all states) / (Total elected MPs of LS and RS). This ensures all MPs have the same vote value regardless of which House they sit in."
      },
      {
        id: "mcq-pres-002",
        question: "Which of the following elements does NOT form part of the Electoral College for the election of the President of India?\n1. Nominated members of Lok Sabha\n2. Elected members of legislative councils of states\n3. Nominated members of Delhi and Puducherry assemblies\n\nSelect the correct answer using the codes below:",
        options: [
          "1 and 2 only",
          "2 and 3 only",
          "1 and 3 only",
          "1, 2 and 3"
        ],
        answer: "D",
        explanation: "All three elements are excluded from the Presidential Electoral College. Article 54 lists exclusively: elected MPs, elected MLAs of states, and elected MLAs of Delhi and Puducherry. Nominated members of Parliament, both elected/nominated members of state Legislative Councils (MLCs), and nominated members of UT assemblies do not vote."
      }
    ],
    mainsQuestions: [
      {
        id: "mains-pres-01",
        question: "Examine the constitutional role and powers of the President of India. To what extent has the office transformed from a mere rubber stamp to an active moral guardian of the Constitution? Support your answers with relevant judicial cases.",
        tokens: ["Constitutional Position", "Article 74", "Moral Guardian", "Samsher Singh Case"]
      }
    ],
    flashcards: [
      {
        id: "fc-pres-001",
        front: "Which Article sets the executive power of the Union in the President of India?",
        back: "Article 53 of the Constitution. It states it can be exercised directly or through subordinate officers.",
        category: "article"
      },
      {
        id: "fc-pres-002",
        front: "What is the key difference of Nominated MPs in Presidential Election vs Impeachment?",
        back: "Nominated MPs CANNOT vote in the election of the President, but they CAN vote in the impeachment process.",
        category: "trap"
      }
    ]
  }
};

export const DEMO_PYQS: PyqBankJson = {
  schemaVersion: "1.0",
  type: "pyqBank",
  metadata: {
    subject: "Polity and Governance",
    exam: "UPSC CSE Prelims",
    years: "2013-2025"
  },
  pyqs: [
    {
      id: "pyq-2018-polity-01",
      year: 218, // 2018
      question: "Consider the following statements:\n1. In the election for the President of India, the value of the vote of an MLA of Madhya Pradesh is greater than that of Kerala.\n2. The value of the vote of an MP of the Lok Sabha is greater than the value of the vote of an MP of the Rajya Sabha.\n\nWhich of the statements given above is/are correct?",
      options: [
        "1 only",
        "2 only",
        "Both 1 and 2",
        "Neither 1 nor 2"
      ],
      answer: "D",
      explanation: "Statement 1 is incorrect: The value of an MLA vote is population of state (1971) divided by number of MLAs * 1000. Kerala's MLA vote value is actually 152, whereas Madhya Pradesh's MLA vote value is 131. MP's value is lower due to different ratios.\nStatement 2 is incorrect: The vote value of all MPs (Lok Sabha and Rajya Sabha) is strictly equal because they are calculated using the same combined state MLAs total value divided by the total number of elected MPs of both houses.",
      subject: "Polity and Governance",
      topic: "President",
      tags: ["Election", "Parliament"]
    },
    {
      id: "pyq-2020-polity-02",
      year: 220, // 2020
      question: "According to the Constitution of India, a Council of Ministersheaded by the Prime Minister must always perform what primary role for the President?",
      options: [
        "To report weekly on administration decisions.",
        "To aid and advise the President in the exercise of his functions.",
        "To approve the appointments made by the President.",
        "To supervise the President's diplomatic schedules."
      ],
      answer: "B",
      explanation: "Article 74(1) of the Constitution mandates: 'There shall be a Council of Ministers with the Prime Minister at the head to aid and advise the President who shall, in the exercise of his functions, act in accordance with such advice.' This binding advice is the engine of the parliamentary system.",
      subject: "Polity and Governance",
      topic: "President",
      tags: ["Article 74", "Union Executive"]
    }
  ]
};

export const UPSC_DEFAULT_FOLDERS = [
  { id: "polity", name: "Polity and Governance", isDefault: true, iconName: "Building" },
  { id: "economy", name: "Economy", isDefault: true, iconName: "TrendingUp" },
  { id: "modern_history", name: "Modern History", isDefault: true, iconName: "History" },
  { id: "ancient_history", name: "Ancient History", isDefault: true, iconName: "Layers" },
  { id: "medieval_history", name: "Medieval History", isDefault: true, iconName: "BookOpen" },
  { id: "art_culture", name: "Art and Culture", isDefault: true, iconName: "Palette" },
  { id: "geography", name: "Geography", isDefault: true, iconName: "Map" },
  { id: "ecology", name: "Environment and Ecology", isDefault: true, iconName: "Leaf" },
  { id: "scitech", name: "Science and Technology", isDefault: true, iconName: "Cpu" },
  { id: "ir", name: "International Relations", isDefault: true, iconName: "Globe" },
  { id: "society", name: "Society and Social Justice", isDefault: true, iconName: "Users" },
  { id: "ethics", name: "Ethics & Integrity", isDefault: true, iconName: "Shield" },
  { id: "essay", name: "Essay Paper", isDefault: true, iconName: "FileText" },
  { id: "security", name: "Internal Security", isDefault: true, iconName: "Lock" },
  { id: "disaster", name: "Disaster Management", isDefault: true, iconName: "AlertTriangle" },
  { id: "ca", name: "Current Affairs", isDefault: true, iconName: "Calendar" },
  { id: "econ_optional", name: "Economics Optional", isDefault: true, iconName: "PieChart" },
  { id: "misc", name: "Miscellaneous Study Notes", isDefault: true, iconName: "Archive" }
];
