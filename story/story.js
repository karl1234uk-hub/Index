/**
 * Our Longest Night — story data.
 *
 * Add a chapter by dropping new scenes into `scenes`. Each scene needs:
 *   id, turn ("karlos" or "sara"), kicker, title, body (paragraphs),
 *   and 2–3 choices: { label, recap, to }.
 * Endings set `ending` to a tone and omit choices and turn.
 * Turns alternate. Every path should reach an ending in 8–14 moves.
 * "Crimson Rose" and "Miss Hex" are titles for Sara, never her name.
 *
 * Check the graph: node story/check-story.js
 */
(function (root, factory) {
  var data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  if (root) root.STORY = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    title: "Our Longest Night",
    tagline: "A rain-soaked city, two vampires, and a night you pass between you.",
    startNote: "Karlos moves first. After each choice, send the link.",
    start: "roof",
    players: {
      karlos: { name: "Karlos", epithet: "The Winterbound", mark: "\u2744" },
      sara: { name: "Sara", epithet: "The Crimson Rose", mark: "\u2766" }
    },
    tones: {
      sweet: "Sweet",
      dangerous: "Dangerous",
      bittersweet: "Bittersweet",
      triumphant: "Triumphant",
      cheeky: "Cheeky"
    },
    scenes: {
      roof: {
        id: "roof",
        turn: "karlos",
        kicker: "Eastside water tower \u00b7 1:17 a.m.",
        title: "Two Things in His Hands",
        body: [
          "Rain needles the iron. Under Karlos the city is neon veins and wet black, and he is doing what he does best: standing still until the night blinks first.",
          "Two things have found him. A black card on the parapet, as if it grew there: *The Red Room. Before dawn. Bring the Rose.* And his phone, still warm from Sara. The voice note sits unplayed. He can already hear the shape of her laugh, a woman who thinks she has won.",
          "The court can wait centuries. Sara has never waited five minutes without turning it into a sport. Karlos turns the card once. The cold in him answers to something that is not the rain."
        ],
        choices: [
          {
            label: "Play her voice note, then go where it sends you.",
            recap: "Karlos played Sara's voice note and went to her before he let the court matter.",
            to: "fire"
          },
          {
            label: "Take the card to her, as if the summons were your idea.",
            recap: "Karlos read the summons and brought it to Sara, cool as if the night had been his plan.",
            to: "card"
          },
          {
            label: "Don't answer either. Show up at the door of Hex.",
            recap: "Karlos went to Hex without calling, the summons folded in his pocket.",
            to: "door"
          }
        ]
      },

      fire: {
        id: "fire",
        turn: "sara",
        kicker: "Fire escape behind Hex",
        title: "You Played It",
        body: [
          "The fire escape is a bad idea with excellent lighting. Sara has one heel on the rail and rain in her lashes. Karlos is suddenly there. She intends to be normal about it for almost four seconds.",
          "\u201cYou played it,\u201d she says. \u201cI can tell. You get this look, like someone moved your furniture half an inch.\u201d She tips her head, smile wrecking the attempt at calm. \u201cHello, Karlos.\u201d",
          "He almost smiles. It counts. Below them Hex thumps like a second weather. \u201cThe court wants a Rose before dawn,\u201d he says, dry as a clean glass. Sara's answer is brighter than the bulb over the door. \u201cThe court can take a number. I'm talking to you.\u201d"
        ],
        choices: [
          {
            label: "Tease him rotten for putting you above a summons.",
            recap: "Sara teased Karlos for choosing her voice over the court, and pulled him toward the club.",
            to: "lowlight"
          },
          {
            label: "Drop the smile. A hunter was in the alley an hour ago.",
            recap: "Sara told Karlos a hunter had already been sniffing around the alley behind Hex.",
            to: "steel"
          }
        ]
      },

      card: {
        id: "card",
        turn: "sara",
        kicker: "Dressing room \u00b7 red bulb",
        title: "Matching Stationery",
        body: [
          "The mirror is polite and looks slightly past Sara. She is touching up a mouth that does not require help. Karlos fills the doorway with rain on his shoulders and the card between two fingers, a man arriving on purpose.",
          "She holds up the twin. \u201cMatching stationery. If they wanted a scandal they could have just asked.\u201d Her eyes are glad and dangerous. \u201cDid the Winterbound come to collect a title, or did Karlos want to see this lipstick up close?\u201d",
          "He lets the silence work. Silence has always been his best coat. \u201cMadam Vesper dislikes being a second choice,\u201d he says. Sara laughs, bright in the red bulb. \u201cThen Madam Vesper and I are going to get along terribly.\u201d"
        ],
        choices: [
          {
            label: "Make the summons a date. Get him onto the floor.",
            recap: "Sara turned the court card into a date and took Karlos onto the floor at Hex.",
            to: "lowlight"
          },
          {
            label: "Tell him the truth under the joke: a hunter is watching.",
            recap: "Sara set the card aside and told Karlos a hunter was already watching Hex.",
            to: "steel"
          }
        ]
      },

      door: {
        id: "door",
        turn: "sara",
        kicker: "The rope line at Hex",
        title: "Weather at the Door",
        body: [
          "Pink neon bleeds into the puddles. Sara sees Karlos before the bouncer does. On this door they call her Miss Hex: black coat, mouth painted like a decision. The Crimson Rose is a title for people with invitations. He did not bring one. He brought himself.",
          "She steps into his space as if the sidewalk were a room they rented. \u201cNo call. No voice note. You just arrived, like weather.\u201d Her smile could pay the cover for the whole line. \u201cHi, Karlos.\u201d",
          "\u201cSara.\u201d He says her name like a key he doesn't jingle in public. Across the street a man in a too-dry coat studies a phone he is not using. Karlos has already counted the exits. Sara has already counted Karlos."
        ],
        choices: [
          {
            label: "Kiss the rain off his jaw and bring him inside.",
            recap: "Sara kissed the rain from Karlos's jaw in front of the rope line and took him inside.",
            to: "lowlight"
          },
          {
            label: "Take his hand. Show him the man across the street.",
            recap: "Sara took Karlos's hand at the door and showed him the hunter watching from across the street.",
            to: "steel"
          }
        ]
      },

      lowlight: {
        id: "lowlight",
        turn: "karlos",
        kicker: "Hex, under the mezzanine",
        title: "The Only Warm Story",
        body: [
          "Hex is throat-deep in red light. Karlos comes in with rain still on his coat and the court's card hidden like a bad idea he is saving. Sara is already turning, already winning, two fingers hooked in his lapel.",
          "\u201cThere you are,\u201d she says. \u201cTall, cold, and trying not to look at my mouth. It's cute. It's doomed.\u201d People dance around them and do not know they are standing next to the only story in the room that bites.",
          "He could let the music have this. He could take the booth, where even a spy would have to squint. Sara walks backward into the dark, eyes on Karlos, and waits to see which kind of trouble he prefers."
        ],
        choices: [
          {
            label: "Let her pull you onto the floor.",
            recap: "Karlos let Sara pull him onto the floor and into the music.",
            to: "heat"
          },
          {
            label: "Steer her into the dark booth.",
            recap: "Karlos steered them into the dark booth, where the club had to squint to see.",
            to: "velvet"
          }
        ]
      },

      steel: {
        id: "steel",
        turn: "karlos",
        kicker: "The wet edge of the club",
        title: "A Coat Too Dry",
        body: [
          "The hunter is the driest thing on a wet street. Sara doesn't point twice. She fits her shoulder under Karlos's like she rented the space, and her voice drops under the rain.",
          "\u201cHe asked the bouncer if Miss Hex had a boyfriend or a handler,\u201d she says. \u201cI said I have a natural disaster. That's you. Try to look devastating.\u201d She glances up, fond and fearless. \u201cYou always do. It's inconvenient.\u201d",
          "Careful shoes. A throat-mic like a tell. Courage doing arithmetic. Ice wants out of Karlos's hands, and easy is how hunters write their reports. Sara's fingers hook his. \u201cRoof or teeth, Karlos. I'm flexible. I'm also not letting go.\u201d"
        ],
        choices: [
          {
            label: "Get her up on the roofs, off the street.",
            recap: "Karlos took Sara up onto the roofs, away from the hunter's line of sight.",
            to: "wind"
          },
          {
            label: "Turn. Let him see both of you looking back.",
            recap: "Karlos turned them to face the hunter instead of running.",
            to: "dare"
          }
        ]
      },

      heat: {
        id: "heat",
        turn: "sara",
        kicker: "The floor",
        title: "Grant It Closer",
        body: [
          "The floor takes them. Sara gets a hand in Karlos's coat and a laugh against his throat, and the Winterbound, who has intimidated centuries, misses a step because she did it on purpose.",
          "\u201cYou dance like you're granting a favor,\u201d she says. \u201cGrant it closer.\u201d Her lipstick is a near miss he will think about for a decade. A man by the booth is too still for the music. Sara sees him see them. She does not, yet, let it change her mouth.",
          "She can drag Karlos closer and let that still man wait. She can put her mouth by his ear and name a hunter before the hunter names them. Only one of those keeps the song. \u201cI know which one I want,\u201d she says, softer, which is how Sara sounds when she means it. \u201cI'm still going to choose out loud.\u201d"
        ],
        choices: [
          {
            label: "Closer. Make the room blur and the man wait.",
            recap: "Sara drew Karlos closer on the floor and let the rest of the room go soft.",
            to: "spark"
          },
          {
            label: "Mouth at his ear: hunter, don't look yet.",
            recap: "Sara caught the hunter in the crowd and told Karlos without breaking the dance.",
            to: "shadow"
          }
        ]
      },

      velvet: {
        id: "velvet",
        turn: "sara",
        kicker: "The dark booth",
        title: "One True Thing",
        body: [
          "Velvet eats the light. Sara's knee finds Karlos's under the table, a fact neither of them files as an accident. Outside the curtain, Hex keeps pretending to be an ordinary sin.",
          "\u201cSay a true thing, Karlos. One. I'm collecting them.\u201d She steals a sip of a drink she doesn't need. Her eyes stay on his mouth, delighted with the trouble she is causing. He gives her the corner of a smile, which is, for him, a speech.",
          "A messenger in an immaculate coat hovers at the curtain, pretending to be atmosphere. Madam Vesper's patience, none of her menace. Sara clocks him and smiles like a woman with options. She can keep this inch. She can sell the court a ticket. \u201cI'm a generous hostess,\u201d she tells Karlos. \u201cI'm also very distracted by you.\u201d"
        ],
        choices: [
          {
            label: "Stay. Let the inch become a promise.",
            recap: "Sara kept them in the booth and let the promise get specific.",
            to: "spark"
          },
          {
            label: "Crook a finger. If the court wants a show, sell tickets.",
            recap: "Sara invited the court's messenger in and made the summons part of the flirt.",
            to: "courtcall"
          }
        ]
      },

      wind: {
        id: "wind",
        turn: "sara",
        kicker: "The roofs above Hex",
        title: "Not My Brand",
        body: [
          "Tile, neon far below, the wind trying and failing to undress the moment. Karlos got her up off the street. Sara is furious about how much she likes his coat around her shoulders. She did not ask. She does not give it back.",
          "\u201cBeing rescued is not my brand,\u201d she says, breathless, delighted. Rain on her mouth. The hunter is a floor down, learning about vertical fear. \u201cKarlos. If we don't stop, where do we wake up? Don't say somewhere safe. I'll push you off on principle.\u201d",
          "Her hand finds his, warm into cold. She can ask him to ice the stairs and buy them the night. She can make him answer the question, the real one, the reason she sent the voice note in the first place. Sara looks at him like the city is a detail. \u201cPractical, or honest. Pick which one you're going to survive.\u201d"
        ],
        choices: [
          {
            label: "Ask him to ice the way behind you.",
            recap: "Sara asked Karlos to freeze the fire escape and make the hunter's climb a misery.",
            to: "shadow"
          },
          {
            label: "Make him answer: if we run, where do we wake?",
            recap: "Sara asked Karlos where they would wake if they kept running and didn't look back.",
            to: "flight"
          }
        ]
      },

      dare: {
        id: "dare",
        turn: "sara",
        kicker: "The alley \u00b7 three heartbeats",
        title: "Bad Math",
        body: [
          "The alley holds its breath. The hunter discovers that being looked at by both of them is a different profession than the one he trained for. Sara steps up beside Karlos, not behind. Rain sticks her hair to her throat.",
          "She smiles like a punchline. \u201cYou're hunting Miss Hex, which is ambitious, and the Winterbound, which is just bad math.\u201d The man's hand twitches toward his coat. Sara doesn't flinch. The fondness in the look she gives Karlos is somehow the most threatening thing in the alley.",
          "\u201cI can let you talk while I stand here being a weapon with a nice mouth,\u201d she murmurs. \u201cOr I talk, you freeze whatever toy he reaches for, and we vanish like a bad decision he has to explain. I'm choosing, Karlos. I just like your face while I do it.\u201d"
        ],
        choices: [
          {
            label: "Let him speak. Be the pretty threat at his side.",
            recap: "Sara let Karlos speak for them and stood at his side as the threat.",
            to: "shadow"
          },
          {
            label: "Speak for both of you, then run the roofs.",
            recap: "Sara spoke for them in the alley, then ran the roofs with Karlos while the hunter relearned fear.",
            to: "flight"
          }
        ]
      },

      spark: {
        id: "spark",
        turn: "karlos",
        kicker: "An inch of club-light",
        title: "The Inch She Won't Close",
        body: [
          "The club has narrowed to an inch. Bass somewhere to the left of real. Sara's mouth is a sentence Karlos has not finished, and she will not finish it for him. She has never been interested in doing all the work.",
          "\u201cYou're staring,\u201d she says, pleased. \u201cHave the thought out loud, Karlos. Or have it against me. I'm not particular. I'm impatient.\u201d Her fingers rest at his collar, over the place a pulse would be if he bothered. \u201cThe court, the morning, all of it. None of them are in this inch. I am. Try to cope.\u201d",
          "He could take her somewhere with a door. He could let the inch die where the light can see it. Sara waits, smiling like a woman who already knows the ending and would still like the speech."
        ],
        choices: [
          {
            label: "A room. She deserves a door, not a crowd.",
            recap: "Karlos took Sara somewhere private, away from the crowd and the noise.",
            to: "alone"
          },
          {
            label: "Here. Let the inch die in the light.",
            recap: "Karlos closed the distance where the club could see it.",
            to: "seen"
          }
        ]
      },

      shadow: {
        id: "shadow",
        turn: "karlos",
        kicker: "Close enough to matter",
        title: "A Mercy, If He Behaves",
        body: [
          "Close enough now that pretending would be rude. The hunter's earpiece ticks. His courage is doing math and disliking the answer. Sara is bright beside Karlos, rain at her temple, eyes asking for a clean kind of ruthless.",
          "\u201cDon't be precious,\u201d she says quietly. \u201cI'm not glass. They can call me the Crimson Rose when they need a headline. You call me Sara. Give him an ending he can limp away from, or a story we wrote. Both are mercies. I'm feeling merciful. Don't spread it around.\u201d",
          "Cold gathers in Karlos's palms, polite as gloves. The man swallows. Somewhere a siren practices being irrelevant. Sara's shoulder stays against his, a line he has no intention of breaking."
        ],
        choices: [
          {
            label: "End his night. Clean, cold, done.",
            recap: "Karlos shut the hunter's night down, cold and finished, with Sara beside him.",
            to: "huntress"
          },
          {
            label: "Let him run home carrying a story you wrote.",
            recap: "Karlos let the hunter go with a story they had authored, useful and afraid.",
            to: "game"
          }
        ]
      },

      courtcall: {
        id: "courtcall",
        turn: "karlos",
        kicker: "A messenger at the curtain",
        title: "Nothing They Can Quote",
        body: [
          "The messenger regrets his excellent coat. Sara has installed him at the edge of the booth and is being so charming it counts as violence. Karlos watches, amused in the way that worries people who know him.",
          "\u201cMadam Vesper expects the Winterbound and the Crimson Rose before dawn,\u201d the man says. \u201cShe dislikes being a second choice.\u201d Sara's smile is lipstick and teeth. \u201cThe Rose is a headline. My name is Sara. Say it properly and I'll consider being on time.\u201d She glances at Karlos. \u201cBack me up or undermine me. Both are attractive.\u201d",
          "He can give the court courtesy, empty and perfect, the kind of answer that cannot be quoted later. He can put Sara's name down like a boundary and walk her out, so the street gets the truth instead of Madam Vesper."
        ],
        choices: [
          {
            label: "Courtesy. Give Vesper nothing she can quote.",
            recap: "Karlos answered the court with perfect, empty courtesy, and Sara let him play it.",
            to: "game"
          },
          {
            label: "Say her name once, as a line they don't cross. Then the street.",
            recap: "Karlos spoke Sara's name as a boundary and walked her out of the court's reach.",
            to: "seen"
          }
        ]
      },

      flight: {
        id: "flight",
        turn: "karlos",
        kicker: "Roofs and side streets",
        title: "The One Direction He Won't Run",
        body: [
          "They move. Tile, alley, the slick black ladder of a fire escape. The city offers a dozen ways to stay uncaught, and Sara takes them like boredom is the real danger. Wind pulls a laugh out of her. Karlos keeps her hand anyway.",
          "\u201cYou still haven't answered,\u201d she says, when a chimney buys them ten seconds. \u201cWhere do we wake, Karlos? Not a poem. A place.\u201d She is flushed with the run, fearless, looking at him like the hunter is a subplot with poor timing.",
          "He can turn them back and finish it. He can stop under the next wash of neon and let the choice be seen, because running from Sara is the one direction he will not take. Behind them, a man is reconsidering his career."
        ],
        choices: [
          {
            label: "They're still coming. Turn and finish it.",
            recap: "Karlos turned them back to finish the chase instead of disappearing.",
            to: "huntress"
          },
          {
            label: "Enough running. Here, in the light, choose her.",
            recap: "Karlos stopped running and chose Sara where the neon could see it.",
            to: "seen"
          }
        ]
      },

      alone: {
        id: "alone",
        turn: "sara",
        kicker: "A room above the rain",
        title: "A Lock, You Menace",
        body: [
          "The room is above the rain, which is as much romance as a city this loud can manage. A lamp. A chair that has survived worse decisions. Sara shuts the door with her heel and leans there, looking at Karlos like she has been patient for several entire minutes.",
          "\u201cA lock. You romantic menace.\u201d She crosses to him without hurrying and stops inside the reach of his cold. \u201cHi. It's me. Sara. Not a headline. If you brought me up here to be careful, careful makes me worse.\u201d",
          "Her hand finds his coat and stays. The kiss she has not taken yet sits between them, well-behaved and doomed. She can meet him in the serious thing. She can catch his hand and spend the rest of the night outside, while the city is still worth misbehaving in. \u201cI want everything,\u201d Sara says. \u201cWatch me pick anyway.\u201d"
        ],
        choices: [
          {
            label: "Meet him in it. Let the seriousness stand.",
            recap: "Sara stayed with the seriousness of the room instead of turning it into a joke.",
            to: "key"
          },
          {
            label: "Catch his hand. The night isn't used up.",
            recap: "Sara took Karlos's hand and pulled them back out before the night was spent.",
            to: "crownpath"
          }
        ]
      },

      seen: {
        id: "seen",
        turn: "sara",
        kicker: "Where the night can look",
        title: "Let Them Fail to Understand",
        body: [
          "He stops hiding it. Neon, rain, a stranger's startled breath: the night turns its head. Sara feels the attention land and is thrilled, which she disguises as poise. Badly.",
          "\u201cOh,\u201d she says, soft and delighted. \u201cWe're doing this where people have eyes. Karlos, you show-off.\u201d She steps in until his cold is a secret the street only half gets. \u201cThey can look. They don't get to understand. That's ours.\u201d",
          "A phone rises and thinks better of it when she glances over, sweet as a warning. She can kiss him here and let the neon gossip. She can demand a door before the city gets any more of her. Karlos waits, which is new for him, and Sara feels the power of that like a hand at her waist."
        ],
        choices: [
          {
            label: "Kiss him in the neon. Let the picture happen.",
            recap: "Sara kissed Karlos in the open and let the city have the picture.",
            to: "crownpath"
          },
          {
            label: "Demand a door. The rest of this is not for them.",
            recap: "Sara demanded a private door before the city could have any more of them.",
            to: "key"
          }
        ]
      },

      huntress: {
        id: "huntress",
        turn: "sara",
        kicker: "The hunter's mistake",
        title: "Embarrassment and Frost",
        body: [
          "The hunter's night ends the way bad plans do: suddenly, and with Sara enjoying herself more than is strictly kind. She moves like laughter with intent. Karlos's cold takes the metal out of the man's hand and the bravery out of his knees.",
          "It is not gore. It is frost on a sleeve, a throat-mic that will only ever play static, a man running because his body filed the paperwork before his pride could. Sara watches him go. Then she looks at Karlos, pulse in her throat, smile gone honest.",
          "\u201cThat was the hottest practical decision you've ever made.\u201d She catches his wrist. Cold skin, warm grip. She can press the lesson until it sticks. She can walk him into the light and let the city see what failed to catch them. \u201cI want the version where you look at me like that again, Karlos. So I'm going to arrange it.\u201d"
        ],
        choices: [
          {
            label: "Press it. Finish what the two of you started.",
            recap: "Sara pushed the advantage and kept Karlos with her until the danger was finished.",
            to: "blade"
          },
          {
            label: "Make the win echo. Take it into the open.",
            recap: "Sara took the win into the open, Karlos at her side, where the city had to see it.",
            to: "crownpath"
          }
        ]
      },

      game: {
        id: "game",
        turn: "sara",
        kicker: "Inside the lie",
        title: "A Dress with His Name In It",
        body: [
          "So this is a performance. Sara has never once been sad about that. She steps into the lie like a dress with Karlos's name stitched where only he can read it, then checks his face to see whether he is playing or confessing.",
          "\u201cWe can give Vesper a perfect little nothing. You do unquotable in your sleep, Karlos. It's why they want you, and why I refuse to let them have you cheap.\u201d She touches his jaw, brief, a match-strike. \u201cOr we ruin the script. A scandal. A locked door. A myth instead of a target.\u201d",
          "Three ways to misbehave, and she is lining up the shot. Spring the plot, cold and exact, together. Abandon the whole script for a lock and his undivided attention. Drag the lie into the street and make it gorgeous. \u201cI'm picking,\u201d Sara says. \u201cTry to keep up. You're pretty when you keep up.\u201d"
        ],
        choices: [
          {
            label: "Spring the plot with him. Cold, exact, together.",
            recap: "Sara chose to spring the court's game with Karlos, precise and side by side.",
            to: "blade"
          },
          {
            label: "Abandon the script. Take him somewhere with a lock.",
            recap: "Sara abandoned the plot and took Karlos somewhere the court could not follow.",
            to: "key"
          },
          {
            label: "Drag the lie into the street and make it a scandal.",
            recap: "Sara turned the lie into a public scandal and dared Karlos to enjoy it.",
            to: "crownpath"
          }
        ]
      },

      key: {
        id: "key",
        turn: "karlos",
        kicker: "The ordinary room",
        title: "Winter Changes Its Mind",
        body: [
          "A door has shut, or is about to. The city thins to rain on glass. Sara leans on the wood and waits Karlos out, because the Winterbound is looking at her like winter has changed its mind and is embarrassed about it.",
          "\u201cDon't you dare be practical,\u201d she says. \u201cI'll forgive a lot of things. Practicality is not on the list.\u201d The kiss, when he gives it, is slow and cold and then not cold at all. She makes a small sound she does not apologize for. His hand settles at her waist like a sentence he is still willing to mean.",
          "He breaks it by a breath, not a retreat. Sara's forehead rests against his. \u201cKarlos.\u201d Just his name, which is worse than flirting. She does not fill the next silence. The room is a promise if he wants it. The sky is still there if he needs one more hour of not being sensible. He is the one who has to say which."
        ],
        choices: [
          {
            label: "Stay. Let the room become the promise.",
            recap: "Karlos stayed in the room with Sara and let the promise stand.",
            to: "threshold"
          },
          {
            label: "Open the door. Give the night one true picture.",
            recap: "Karlos opened the door and took Sara back into the night, done hiding it.",
            to: "spotlight"
          }
        ]
      },

      crownpath: {
        id: "crownpath",
        turn: "karlos",
        kicker: "Neon on the water",
        title: "Trying Not to Chase",
        body: [
          "The street receives them. Neon breaks on the puddles like it spent money to do it. Sara walks backward for three steps because she likes Karlos's face when he is trying not to chase her and failing in inches.",
          "\u201cYou're smiling,\u201d she says, accusing and soft. \u201cI'll tell the court. The Winterbound, caught feeling things. Think of the paperwork.\u201d She stops only when his hands find her waist. Rain writes cold on both of them. Hers doesn't last.",
          "He can let the street keep a kiss it will gossip about. He can steal her toward a quieter door, because some of what he wants is not a performance, and Sara, for all her love of an audience, is looking at him like she would follow him out of the light."
        ],
        choices: [
          {
            label: "Let them watch. Kiss her like a headline.",
            recap: "Karlos kissed Sara in the street and let the city keep the headline.",
            to: "spotlight"
          },
          {
            label: "Steal her somewhere quiet. The rest is ours.",
            recap: "Karlos stole Sara away from the audience and toward a quieter door.",
            to: "threshold"
          }
        ]
      },

      blade: {
        id: "blade",
        turn: "karlos",
        kicker: "After the cold",
        title: "A Difficult Alphabet",
        body: [
          "It is done, or so nearly done that the difference is paperwork. Cold still sits in Karlos's hands. Whatever thought it was hunting, a man or a lie, has found a worse evening than it planned. Sara is bright-eyed, unharmed, and looking at him like that was a love letter in a difficult alphabet.",
          "\u201cYou're all right,\u201d she says. Not a question. A check she needed. Her palm finds the side of his neck, warm, sure of itself. \u201cGood. I have plans that require you insufferable and intact.\u201d Somewhere a siren tries on their street and doesn't commit.",
          "He can stay in the aftermath with her, the shake and the want and the ridiculous urge to laugh. He can carry what they just survived into the open, where the city and Madam Vesper will have to look at it. Sara's thumb strokes once. \u201cDon't go somewhere in your head, Karlos. Take me with you. I made that rule up. It's binding.\u201d"
        ],
        choices: [
          {
            label: "Stay in the aftermath with her.",
            recap: "Karlos stayed with Sara in the aftermath instead of turning cold and gone.",
            to: "after"
          },
          {
            label: "Take the win into the open, where it echoes.",
            recap: "Karlos carried the win into the open with Sara, where it would echo.",
            to: "spotlight"
          }
        ]
      },

      threshold: {
        id: "threshold",
        turn: "sara",
        kicker: "A door that isn't performing",
        title: "If I Lock This",
        body: [
          "He got them to a door that isn't performing for anyone. Sara puts her back to it and looks at Karlos. The lamp is low. The rain is a rumor with good manners. Her courage, usually a trumpet, has gone quiet and precise.",
          "\u201cIf I lock this, I'm not unlocking it for Madam Vesper, a hunter, or the sun.\u201d She almost smiles. \u201cYou may still show off. Briefly. It's your brand, and I happen to collect it.\u201d She takes his cold hand and sets it at her waist. Nothing more than that, and somehow worse.",
          "She can turn the lock and keep him until dawn is only a rumor. She can take that same hand up to the roof and spend one more hour against the sky before either of them is sensible. \u201cI'm not asking the court,\u201d Sara says. \u201cYou already answered by being here, Karlos. So I'll say which door.\u201d"
        ],
        choices: [
          {
            label: "Lock it. Stay until dawn is a rumor.",
            recap: "Sara locked the door and chose to keep Karlos until morning was only a rumor.",
            to: "ending-dawn"
          },
          {
            label: "The roof. One more hour against the sky.",
            recap: "Sara took Karlos up to the roof for one more hour before the night decided.",
            to: "lastroof"
          }
        ]
      },

      spotlight: {
        id: "spotlight",
        turn: "sara",
        kicker: "A picture the city didn't order",
        title: "The City Blinks",
        body: [
          "They let the city have a picture. Not a long one. Long enough. Neon clings to the wet street, and Sara's hand is in Karlos's coat pocket like it pays rent there. Someone across the road forgets how to walk.",
          "\u201cA scandal with good bone structure,\u201d she says, delighted and a little wrecked. She turns into him. The kiss is unhidden: cold mouth, her laugh caught in it, his hand sure at her back. When they part, her lipstick has signed him. He looks offended. It is how Karlos looks when he is happy.",
          "This can be the whole victory. She saw the city blink. Or Madam Vesper hears it from Sara's mouth, with him beside her, instead of from a rumor with their names spelled wrong. Sara touches his lip, smug and soft. \u201cI'm choosing, Karlos. Look handsome about it.\u201d"
        ],
        choices: [
          {
            label: "Let the blink be the victory. Walk off.",
            recap: "Sara let the public kiss be the victory and walked Karlos off into the night.",
            to: "ending-neon"
          },
          {
            label: "Make Madam Vesper hear it to her face.",
            recap: "Sara decided Madam Vesper would hear the truth from them, not from a rumor.",
            to: "lastcourt"
          }
        ]
      },

      after: {
        id: "after",
        turn: "sara",
        kicker: "Wet brick \u00b7 sirens somewhere",
        title: "Insufferable and Intact",
        body: [
          "The dangerous part is still leaving the block. Sara has Karlos against wet brick anyway, her hands in his coat, her forehead to his like she is counting him and finding the number acceptable.",
          "\u201cYou're cold,\u201d she says, laughing once, shaky. \u201cGood. I was worried the night had made you reasonable.\u201d She kisses the corner of his jaw, then the place under his ear, and feels him go still in the way that means more, not stop. Blue light slides over them and moves on, as if even the emergency has manners.",
          "She can disappear into the kiss and let the sirens file a complaint. She can be ridiculous and take him to a diner that has never heard of Madam Vesper. She can follow the money back to the court that pays men to be brave at vampires. \u201cI know exactly how I want you,\u201d Sara says. \u201cThe rest is logistics, Karlos.\u201d"
        ],
        choices: [
          {
            label: "Kiss him before the sirens get clever.",
            recap: "Sara kissed Karlos in the alley and chose him over getting gone cleanly.",
            to: "ending-siren"
          },
          {
            label: "Fries. Cash in his dignity at the diner on 9th.",
            recap: "Sara hauled Karlos to the diner on 9th and cashed his dignity in for fries.",
            to: "ending-fries"
          },
          {
            label: "Someone paid for that hunt. Make the court answer.",
            recap: "Sara followed the hunt back to the court and took Karlos with her to collect.",
            to: "lastcourt"
          }
        ]
      },

      lastroof: {
        id: "lastroof",
        turn: "karlos",
        kicker: "The roof, later",
        title: "Hi, Karlos",
        body: [
          "The roof is a different country from the room, and Sara arrives on it like she paid for the wind. The city is a circuit board below. Karlos watches her laugh at nothing, at everything, at him.",
          "\u201cOne more hour. You and your noble delays. Come here.\u201d She doesn't wait long. The kiss tastes like rain and the lipstick she has been spending all night. His hands frame her face, careful, as if careful were still available. It isn't. She smiles against his mouth. \u201cThere he is. Hi, Karlos.\u201d",
          "On the next roof, something moves that is not weather. A red point. Then another. Beyond the sights, far and black and lit in pieces, the river bridge waits like a sentence nobody has said out loud. Sara sees his eyes change and does not look away. \u201cTalk to me. Not the strategy. Me.\u201d"
        ],
        choices: [
          {
            label: "Kiss her until the rain forgets its job.",
            recap: "Karlos kissed Sara on the roof and let the hunters and the bridge wait.",
            to: "ending-dawn"
          },
          {
            label: "Tell her. Hunters on the next roof. The bridge beyond.",
            recap: "Karlos told Sara the truth: hunters on the next roof, and the bridge beyond them.",
            to: "onemore"
          }
        ]
      },

      lastcourt: {
        id: "lastcourt",
        turn: "karlos",
        kicker: "The Red Room",
        title: "Candles and a Verdict",
        body: [
          "The Red Room is under a hotel that swears it has no basement. Candles, because Madam Vesper thinks electricity is a phase. She sits like a verdict: old, lovely, and tired of other people's love stories unless she can tax them.",
          "\u201cWinterbound. And Sara. I was promised a Rose and given a woman. How modern.\u201d Her smile could cut fruit. \u201cYou have been very visible. I sent a card, and I employ people who are worse than cards. You seem to have enjoyed yourselves anyway. I admire bad manners when they are this well dressed.\u201d",
          "Sara's hand is in Karlos's, hidden from no one. She is smiling the smile from before she reorganizes a room. He can take the floor with her until Vesper concedes the night. He can slip them out a side door and leave the elder her candles. Sara squeezes once. It means she is already proud of him."
        ],
        choices: [
          {
            label: "Take the floor together. Make her concede the night.",
            recap: "Karlos took the Red Room with Sara and made Madam Vesper concede the night.",
            to: "ending-throne"
          },
          {
            label: "Slip out. This night isn't finished with us.",
            recap: "Karlos slipped them out of the Red Room before the court could finish the sentence.",
            to: "onemore"
          }
        ]
      },

      onemore: {
        id: "onemore",
        turn: "sara",
        kicker: "The street that leads to the river",
        title: "The Honest Part",
        body: [
          "Outside again. Behind them, a door they refused to let finish its sentence. Ahead, the river turns the neon into loose change on black water. Sara's laugh is smaller than usual. That is how Karlos knows she is about to tell the truth.",
          "\u201cWe could keep winning. You're very good at it. It's disgusting. I like it.\u201d She bumps his shoulder. \u201cWe could also stand in the middle of that bridge and be two people the court doesn't get to file. Different mornings are waiting. I'm not pretending the distance isn't real.\u201d",
          "She looks up, rain in her lashes, brave on purpose. She can take him onto the bridge and be honest, even the part that aches. She can turn them around and make a legend that behaves. \u201cI'm going to pick, Karlos. Don't you dare go noble and quiet on me until after.\u201d"
        ],
        choices: [
          {
            label: "The bridge. They don't get to file this.",
            recap: "Sara chose the bridge, and an honest goodbye the court would never get to file.",
            to: "ending-bridge"
          },
          {
            label: "Turn around. You want the version where you win.",
            recap: "Sara turned them around to finish the night in front of everyone who doubted it.",
            to: "turnback"
          }
        ]
      },

      turnback: {
        id: "turnback",
        turn: "karlos",
        kicker: "Turning around",
        title: "Trouble, on Purpose",
        body: [
          "He turns them around. Sara makes a sound that is half laugh and half *there you are*, and matches his stride like they rehearsed it in a life with better timing. Ice in his walk. Her hand in his. The quiet of a man who has decided to be trouble on purpose.",
          "\u201cLegends are mostly paperwork and bad lighting,\u201d Karlos says. \u201cWe can still do one.\u201d The door they left waits ahead, confident and about to be disappointed. To the left, a diner sign flickers as if it has never heard of Madam Vesper and would not be impressed.",
          "Sara looks at the door, then at him, then at the sign. Her grin is a crime. \u201cDon't you dare be funnier than me in the final act.\u201d He can take them through and let her have the last word in front of everyone. He can, because he is still himself, aim them at a booth instead. Destiny is not on the menu."
        ],
        choices: [
          {
            label: "Through the door. In front of them.",
            recap: "Karlos walked them back through the last door to finish it in the open.",
            to: "finale"
          },
          {
            label: "The diner. Destiny can invoice us later.",
            recap: "Karlos swerved them into the diner and let destiny invoice somebody else.",
            to: "ending-fries"
          }
        ]
      },

      finale: {
        id: "finale",
        turn: "sara",
        kicker: "The last door",
        title: "Which Life",
        body: [
          "The last door is ordinary, which is an insult. Sara pauses with her hand on it anyway. Karlos is at her shoulder, cold and sure, the Winterbound in full and also just the man who came when she asked. Voices on the other side think they are about to win.",
          "\u201cWe can give them a show. Smile, take the room, leave them a story that behaves.\u201d She looks at his mouth, then his eyes, playful falling away into something bare. \u201cOr we leave them a legend and a mess, and we take the bridge. I want the win, Karlos. I want you more. Those aren't always the same door.\u201d",
          "She lifts her chin. Miss Hex, the headline, Sara, all of them in one woman who is done asking permission. \u201cYou already turned us around. Let me finish it.\u201d"
        ],
        choices: [
          {
            label: "Take the room. Smile while you do it.",
            recap: "Sara took the room with Karlos and smiled while the night changed hands.",
            to: "ending-throne"
          },
          {
            label: "Leave them the mess. Take him to the bridge.",
            recap: "Sara left the victory behind and took Karlos to the bridge instead.",
            to: "ending-bridge"
          }
        ]
      },

      "ending-dawn": {
        id: "ending-dawn",
        ending: "sweet",
        kicker: "Until morning is only a rumor",
        title: "Until Dawn Is a Rumor",
        body: [
          "They keep it. A locked door, or a roof with the whole city under it: the difference is furniture. Sara laughs into Karlos's coat, quieter than she has been all night, and the quiet is not a retreat. It is trust. She gives it like a match. He holds it like a man who knows what fire costs.",
          "\u201cDon't be practical,\u201d she murmurs, already against him, already home for the hour. \u201cI haven't been practical since your first voice note,\u201d Karlos says, and kisses her hair, then her mouth, slow, the kind of kiss that ends a paragraph on purpose.",
          "What happens after the lock, or after the wind takes the rest of the sentence, is not for the court, the hunters, or the morning with an ocean in it. Dawn stays a rumor. He keeps watch, because that is his way of being soft. She agrees to be still, which for Sara is a kind of vow. His hand stays at her waist. The city can have every other night. This one has their names on it."
        ]
      },

      "ending-neon": {
        id: "ending-neon",
        ending: "triumphant",
        kicker: "Under the sign at Hex",
        title: "The Street Blinks First",
        body: [
          "The kiss breaks, and the street has to remember how to be a street. Sara's lipstick has signed Karlos. He looks offended, which is how happiness presents in him, and she is not done being proud of either of them.",
          "\u201cYou've terrorized a camera,\u201d he says, dry, happier than he will admit before next Tuesday. \u201cI'm proud of you. This is worrying.\u201d Sara straightens his collar, which does not need it. \u201cWe walked out of a summons and into a better story. Say something grand.\u201d \u201cNo.\u201d \u201cPerfect.\u201d",
          "The black card ends in a puddle, the seal going to mush. Madam Vesper can fish it out herself. They walk, her hand in his pocket, his shoulder against hers, two vampires hiding in plain sight and doing a terrible job. The city learns their shape and decides to mind its business. Tonight triumph is not a throne. It is a street, Sara's laugh, and Karlos not getting over it."
        ]
      },

      "ending-siren": {
        id: "ending-siren",
        ending: "dangerous",
        kicker: "Blue light on wet brick",
        title: "Please, in a Different Language",
        body: [
          "The sirens get opinions. Sara does not take them. She kisses Karlos against the brick like the alley is a room they paid for: cold mouth, her hands sure in his coat, the kind of kiss that would start a rumor if the wrong people are watching. Maybe they are. She kisses him anyway.",
          "His control, famous and tedious, slips enough to make her smile against his mouth. \u201cThere. That's my favorite version of you.\u201d A shout rolls down the block, human, armed with the wrong century. Frost crawls a puddle because Karlos is feeling things and the weather has to cope.",
          "They run, but not before she drags him back for one more. Blue light slides over his face, her ruined lipstick, the fact of them chosen in the middle of a bad idea. Not safe. Not sorry. At the corner Sara laughs, wild and bright, and Karlos, terror of patient rooms, says, \u201cYou're going to be the end of me,\u201d in a voice that means the opposite. The night takes them. It does not give them back to anyone with a badge."
        ]
      },

      "ending-fries": {
        id: "ending-fries",
        ending: "cheeky",
        kicker: "The diner on 9th \u00b7 fluorescent and unafraid",
        title: "A Strategic Asset",
        body: [
          "The diner is a fluorescent apology for the rest of the night. Sara slides into the booth first and steals Karlos's fries before the plate has finished being a plate. He looks at her with the grave dignity of an ancient power.",
          "\u201cThat fry was a strategic asset.\u201d \u201cIt was a potato, Karlos.\u201d \u201cI was using it.\u201d She points the next one at him like a scepter. \u201cSay it. Say the fry is yours and you are a formidable man.\u201d He holds her gaze. \u201cThe fry is mine. I am a formidable man.\u201d She eats it. He closes his eyes for exactly one second. \u201cTragedy. Give me your hand.\u201d",
          "She does. Salty fingers. He kisses her knuckles as if the diner were a court that had finally learned the dress code. The waitress tops up a coffee that immediately loses the will to steam, and decides she has seen nothing, especially not that. \u201cYou're showing off,\u201d Sara whispers, delighted. \u201cI'm adapting,\u201d Karlos says. \u201cIt's this or the ancient vampire war.\u201d She kisses the smugness off his mouth, quick and sweet. \u201cFries won. Be cold. It's your brand.\u201d Outside, the summons can form a line. He lets her steal another. It is the most romantic thing he has done all night, and he has done several."
        ]
      },

      "ending-bridge": {
        id: "ending-bridge",
        ending: "bittersweet",
        kicker: "The middle of the bridge",
        title: "A Key, Not a Wound",
        body: [
          "They take the bridge. The river is full of broken neon, and the city pretends not to watch from both banks. Sara stops them in the middle, because of course she does, and holds Karlos's coat in two fists so he cannot be noble at a distance.",
          "\u201cDifferent mornings,\u201d she says. She does not dodge it. \u201cA gate. A text over the clouds. Your roof or mine, and a rude amount of planet in between. I'm still choosing you. Hear that without fixing it.\u201d The wind is cold. He is colder. She has never minded.",
          "\u201cI hear it.\u201d His thumb finds her cheek. He doesn't check whether the wet is rain. \u201cSame night, next time. I don't care which sky. Bring that mouth. I'll bring the rest.\u201d The kiss is meant to be remembered on purpose, not as a wound, as a key. They walk to different ends because the morning is real, and they look back once, badly synchronized and not sorry. The court gets no file. Sara gets a text before she has left the bridge: *Unbearable already. Your fault.* She laughs out loud. The river keeps it. So does Karlos, who is already worse, and glad."
        ]
      },

      "ending-throne": {
        id: "ending-throne",
        ending: "triumphant",
        kicker: "The Red Room, rearranged",
        title: "The Crimes Are Optional",
        body: [
          "They take the room. Not with a massacre. With manners sharpened until Madam Vesper's smile cracks along a line she did not authorize. Sara stands at Karlos's side, not a step behind, and the Red Room, which has watched centuries try to be interesting, sits up.",
          "\u201cYou sent a card and a reputation,\u201d Sara says, pleasant as poison. \u201cKeep both. His name is Karlos. Mine is Sara. The titles were cute. We're keeping each other instead.\u201d He doesn't raise his voice. He never has to. \u201cThe summons is declined. If you sent anyone after us, call them off. We will be visible when we feel like it, and inconvenient always.\u201d Frost feathers Vesper's glass. She looks at it, then at them, and, astonishingly, she laughs.",
          "\u201cGo,\u201d the elder says. \u201cBe a problem somewhere I can deny.\u201d They go hand in hand, the room's attention stuck to their backs like burrs. In the stair that swears it isn't there, Sara bumps him, giddy and fierce. \u201cWe should do crimes more often.\u201d \u201cWe should do this more often,\u201d Karlos says. \u201cThe crimes are optional.\u201d She kisses him in the dark of the stair, quick and sure, a seal on a treaty the court did not get to write. Above them the city is still raining. For a whole ten minutes it belongs to them."
        ]
      }
    }
  };
});
