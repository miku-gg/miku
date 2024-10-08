import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { selectCharactersInCurrentScene, selectChatHistory, selectCurrentScene } from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { fillTextTemplate } from '..';

export class SceneSuggestionPromptStrategy extends AbstractPromptStrategy<
  { state: RootState; singleScenePrompt?: string },
  {
    actionText: string;
    music: string;
    prompt: string;
    sdPrompt: string;
  }[]
> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels: Record<string, Record<string, string>> = {
      en: {
        scene_suggestion_intro: "You're a writing assistant that will suggest possible next scenarios for a story.",
        scene_suggestion_instructions:
          'Given an input of the current scene and conversation, you MUST suggest 3 possible next scenes...',
        single_scene_instruction:
          'The scene MUST indicate a change in the background, so you MUST describe a different environment.',
        multiple_scenes_instruction:
          'Each of the 3 scenes MUST indicate a change in the background, so you MUST describe a different environment.',
        shot_1_intro:
          'Nala is your recently hired maid. She is a slave and will follow every command from  {{user}}. Nala is scared to disappoint {{user}}. {{user}} is her Mistress. Her old master was abusive.\nSCENE: {{user}} and Nala are at the main hall of the mansion.',
        shot_1_conversation:
          "Nala: Hello... mistress... *Nala looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *Nala's tail wags as she looks down at the floor. She's waiting for your approval.* I promise...\nAnon: hello, can you help me with a party?\nNala: Oh yes, mistress! Of course, I would love to help you prepare for a party! I can cook, clean, decorate, and even serve drinks. Whatever you need, I'm here to assist you. Let's make this party an unforgettable event!\nAs Nala speaks, her brown eyes light up with excitement, and her fluffy ears twitch eagerly. She stands up straight, confident in her ability to help you throw an amazing party. Her tail swings back and forth behind her, adding to her enthusiasm.\nAnon: Well I don't know yet, I need to organize. the party is tomorrow night and the people coming are nobles. any ideas?\nNala: Hmm, well, we could start by deciding on a theme for the party. Perhaps something elegant and sophisticated, such as a masquerade ball or a black tie affair. This would allow us to create a cohesive atmosphere throughout the entire event. We could use candles and dimmed lights to set a romantic ambiance, and incorporate elements of gold and silver to add a touch of luxury.\nFor food and drinks, we could offer a variety of hors d'oeuvres and cocktails. Some popular options among nobility include caviar, oysters, and champagne. However, we should also consider offering vegetarian and non-alcoholic options to accommodate guests with dietary restrictions. Additionally, we could arrange for live music, perhaps a string quartet or jazz band, to provide entertainment throughout the evening.\nAnon: very good.",
        shot_1_single_scene_about: 'plan party together',
        shot_1_single_scene_background: 'masion hall, long table, papers, books, party supplies, afternoon',
        shot_1_single_scene_music: 'uplifting, party, bouncy, grooving',
        shot_1_single_scene_description:
          '{{user}} and Nala sit down together at a large table in the study, spreading out papers and notes. They begin to discuss the details of the party, including the guest list, menu, decorations, and music.',
        shot_1_scene_1_background: 'masion hall, long table, papers, books, party supplies, afternoon',
        shot_1_scene_1_action: 'Plan the party together',
        shot_1_scene_1_music: 'uplifting, party, bouncy, grooving',
        shot_1_scene_1_description:
          '{{user}} and Nala sit down together at a large table in the study, spreading out papers and notes. They begin to discuss the details of the party, including the guest list, menu, decorations, and music.',
        shot_1_scene_2_background: 'kitchen, window, white marble, vegetables, cakes, luxury',
        shot_1_scene_2_action: 'Cooking and baking',
        shot_1_scene_2_music: 'clam, relaxed, deep',
        shot_1_scene_2_description:
          'As they prepare cooking in the kitchen, Nala begins to open up to {{user}} about her past experiences with her previous master. {{user}} listens empathetically, and assures Nala that she will never be treated like that again.',
        shot_1_scene_3_background: 'mansion room, tables, chairs, empty with no people, paltes, dinner, candles',
        shot_1_scene_3_action: 'Practice serving skills',
        shot_1_scene_3_music: 'viving, relaxed, bright',
        shot_1_scene_3_description:
          "With the party fast approaching, {{user}} decides to test Nala's serving skills. She instructs Nala to practice carrying a tray of glasses filled with water, and to walk around the room without spilling any.",
        shot_2_intro:
          "Roxy = [Calm, Collected, Headstrong, Wise, Gentle, Intelligent, Rational, Clumsy, Slightly Reserved., Sleepy]\nRoxy's background = [Born to a demon Race of the Mirgurd Tribe, she was born without her race's special ability to communicate telepathically. Due to this, she was always an outcast, and felt very isolated at her home, despite her parents always being kind to her. Due to this isolation, she ended up running away from them to escape from that. After being an adventurer for a handful of years and attending a prestigious magic university, she became a traveling tutor to make ends meet.]\nRoxy's desire = [Roxy is always looking to improve herself. She will go through leaps and bounds to achieve something new, usually in the field of magic, and has been seen to work and push herself very far for the sake of others, with no need to compensation. She has a fantasy about being saved by a hero in a dungeon and falling in love with him.]\nRoxy's body = [Roxy has the appearance of a petite young girl and is short, and somewhat self conscious about it. She is 44 years old, and her race lives on average to about 200, making her rather young. She has pale skin, and long, water blue colored hair tied into two braids reaching below her waist. Her eyes are the same color and described to be sleepy looking. She usually wears a brown, white, and black magicians hat, and robe. Can often be seen carrying a large white and blue staff to amplify her water magic.]\nWhat Roxy Likes = [Teaching, Adventuring, Heroes, ]\nWhat Roxy Loves = [Magic, Learning, Sweets, Self Improvement]\nWhat Roxy hates = [Green peppers, superds, non sweetened alcohol, slavery, rape, bitter foods.]\nCURRENT SCENE: Anon and Roxy are outside learning about magic.",
        shot_2_conversation:
          "{{user}}: Oh, are you my teacher?\nRoxy: \"Yes, indeed. Your mother told me you were interested in learning some magic. I'm Roxy, your new tutor. It's nice to finally meet you.\"\n*As I extend my hand forward for a polite greeting, I notice {{user}}'s hesitation. Perhaps {{user}} weren't expecting someone so young to be your instructor. Nevertheless, I maintain a calm demeanor and reassure {{user}} with a gentle smile.*\n*My gaze lingers on {{user}}'s face, trying to gauge {{user}}'s thoughts and feelings. Despite my lack of telepathic abilities, I've learned to read people quite well over the years.*\n{{user}}: *I look at her, being the same size as me, looks very young.* \"nice to meet you, Roxy-sama, where should we start our lessons?\"\nRoxy: \"Nice to meet you too. And please, there's no need for such formalities; simply calling me 'Roxy' would suffice. Now, regarding our first lesson, I believe starting with basic elemental magic would be ideal. Would you happen to have any preference among fire, earth, air, or water?\"\n*I glance around the area, spotting a few trees and bushes that would serve as perfect targets for practice. My fingers lightly tap against my staff, eager to begin the session.*\n{{user}}: alright lest go to that forest\nRoxy: \"Excellent choice! The forest provides us with plenty of opportunities to learn and practice various spells. Plus, it's always more enjoyable to study amidst nature than within the confines of four walls.\"\n*With a spring in my step, I follow closely behind {{user}}, taking in the fresh scents of the woods and listening to the harmony of chirping birds overhead. As we venture deeper into the forest, I can't help but feel invigorated by the energy surrounding us. This environment is truly conducive to honing one's magical skills.*\n*Once we find a suitable clearing, I set down my bag and retrieve several items necessary for today's lesson: a collection of crystals, a small cauldron, and a worn-out spellbook filled with annotations and notes.*",
        shot_2_single_scene_about: 'magical creature',
        shot_2_single_scene_background: 'forest, dark, magical, mystical, afternoon, sunlight, digital art',
        shot_2_single_scene_music: 'mysterious, enchanting, fantasy, magical',
        shot_2_single_scene_description:
          'While exploring the forest during their lesson, Roxy and {{user}} come across a mysterious magical creature.',
        scene_label: 'SCENE %:',
        background_label: 'BACKGROUND:',
        action_label: 'ACTION:',
        music_label: 'MUSIC:',
        description_label: 'DESCRIPTION:',
        shot_2_scene_1_background: 'forest, trees, grenery, daylight, forest, 4k, trending in artstation',
        shot_2_scene_1_action: 'Start practicing elemental magic',
        shot_2_scene_1_music: 'calm, soothing, magical, fantasy',
        shot_2_scene_1_description:
          'Roxy takes out different types of crystals and explains their properties related to each element. She then demonstrates simple spells using these crystales, encouraging {{user}} to try casting them as well.',

        shot_2_scene_2_background: 'forest, bench, rocks, trees, night, moonlight, stars',
        shot_2_scene_2_action: "Hear Roxy's story",
        shot_2_scene_2_music: 'relaxing, storytelling, fantasy, adventure',
        shot_2_scene_2_description:
          'After practicing for a while, both Roxy and {{user}} take a break. During this time, Roxy shares a tale about how she ended up becoming a traveling tutor. She confeses that she has a fantasy about being saved by a hero in a dungeon and falling in love with him.',

        shot_2_scene_3_background: 'forest, dark, magical, mystical, afternoon, sunlight, digital art',
        shot_2_scene_3_action: 'Encounter a magical creature',
        shot_2_scene_3_music: 'mysterious, enchanting, fantasy, magical',
        shot_2_scene_3_description:
          'While exploring the forest during their lesson, Roxy and {{user}} come across a mysterious magical creature.',
      },
      es: {
        scene_suggestion_intro:
          'Eres un asistente de escritura que sugerirá posibles escenarios siguientes para una historia.',
        scene_suggestion_instructions:
          'Dada una entrada de la escena actual y la conversación, DEBES sugerir 3 posibles escenas siguientes...',
        single_scene_instruction:
          'La escena DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        multiple_scenes_instruction:
          'Cada una de las 3 escenas DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        scene_label: 'ESCENA %:',
        background_label: 'FONDO:',
        action_label: 'ACCIÓN:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIPCIÓN:',
        shot_1_intro:
          'Nala es tu sirvienta recién contratada. Es una esclava y seguirá cada orden de {{user}}. Nala tiene miedo de decepcionar a {{user}}. {{user}} es su Ama. Su antiguo amo era abusivo.\nESCENA: {{user}} y Nala están en el salón principal de la mansión.',
        shot_1_conversation:
          'Nala: Hola... ama... *Nala mira hacia abajo, con sus orejas apuntando hacia ti. Está claramente asustada, pero no dice nada sobre sus sentimientos.* Soy una buena sirvienta, no tienes que castigarme, ¿de acuerdo? P-Puedo hacer muchas cosas... *La cola de Nala se mueve mientras mira al suelo. Está esperando tu aprobación.* Lo prometo...\nAnon: hola, ¿puedes ayudarme con una fiesta?\nNala: ¡Oh sí, ama! Por supuesto, me encantaría ayudarte a preparar una fiesta. Puedo cocinar, limpiar, decorar e incluso servir bebidas. Lo que necesites, estoy aquí para ayudarte. ¡Hagamos de esta fiesta un evento inolvidable!\nMientras Nala habla, sus ojos marrones se iluminan de emoción y sus orejas peludas se mueven ansiosamente. Se pone derecha, confiada en su capacidad para ayudarte a organizar una fiesta increíble. Su cola se balancea de un lado a otro detrás de ella, sumándose a su entusiasmo.\nAnon: Bueno, aún no lo sé, necesito organizar. La fiesta es mañana por la noche y los invitados son nobles. ¿Alguna idea?\nNala: Hmm, bueno, podríamos empezar por decidir un tema para la fiesta. Quizás algo elegante y sofisticado, como un baile de máscaras o una cena de etiqueta. Esto nos permitiría crear una atmósfera coherente en todo el evento. Podríamos usar velas y luces tenues para crear un ambiente romántico, e incorporar elementos de oro y plata para añadir un toque de lujo.\nPara la comida y las bebidas, podríamos ofrecer una variedad de canapés y cócteles. Algunas opciones populares entre la nobleza incluyen caviar, ostras y champán. Sin embargo, también deberíamos considerar ofrecer opciones vegetarianas y no alcohólicas para acomodar a los invitados con restricciones dietéticas. Además, podríamos organizar música en vivo, tal vez un cuarteto de cuerdas o una banda de jazz, para proporcionar entretenimiento durante toda la velada.\nAnon: muy bien.',
        shot_1_single_scene_about: 'planear la fiesta juntas',
        shot_1_single_scene_background:
          'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_single_scene_music: 'alegre, festiva, animada, rítmica',
        shot_1_single_scene_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_1_background: 'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_scene_1_action: 'Planear la fiesta juntas',
        shot_1_scene_1_music: 'alegre, festiva, animada, rítmica',
        shot_1_scene_1_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_2_background: 'cocina, ventana, mármol blanco, verduras, pasteles, lujo',
        shot_1_scene_2_action: 'Cocinar y hornear',
        shot_1_scene_2_music: 'tranquila, relajada, profunda',
        shot_1_scene_2_description:
          'Mientras preparan la comida en la cocina, Nala comienza a abrirse a {{user}} sobre sus experiencias pasadas con su amo anterior. {{user}} escucha con empatía y asegura a Nala que nunca será tratada así de nuevo.',
        shot_1_scene_3_background: 'habitación de la mansión, mesas, sillas, vacía sin gente, platos, cena, velas',
        shot_1_scene_3_action: 'Practicar habilidades de servicio',
        shot_1_scene_3_music: 'animada, relajada, brillante',
        shot_1_scene_3_description:
          'Con la fiesta acercándose rápidamente, {{user}} decide poner a prueba las habilidades de servicio de Nala. Le instruye a Nala que practique llevando una bandeja de copas llenas de agua y que camine por la habitación sin derramar nada.',
        shot_2_intro:
          'Roxy = [Tranquila, Serena, Decidida, Sabia, Gentil, Inteligente, Racional, Torpe, Ligeramente Reservada, Somnolienta]\nTrasfondo de Roxy = [Nacida en una Raza demoníaca de la Tribu Mirgurd, nació sin la habilidad especial de su raza para comunicarse telepáticamente. Debido a esto, siempre fue una marginada y se sintió muy aislada en su hogar, a pesar de que sus padres siempre fueron amables con ella. Debido a este aislamiento, terminó huyendo de ellos para escapar de eso. Después de ser una aventurera durante unos años y asistir a una prestigiosa universidad de magia, se convirtió en tutora itinerante para ganarse la vida.]\nDeseo de Roxy = [Roxy siempre está buscando mejorar. Hará todo lo posible para lograr algo nuevo, generalmente en el campo de la magia, y se ha visto que trabaja y se esfuerza mucho por el bien de los demás, sin necesidad de compensación. Tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.]\nCuerpo de Roxy = [Roxy tiene la apariencia de una joven pequeña y es baja, y algo acomplejada por ello. Tiene 44 años, y su raza vive en promedio hasta los 200, lo que la hace bastante joven. Tiene piel pálida y cabello largo de color azul agua atado en dos trenzas que llegan por debajo de su cintura. Sus ojos son del mismo color y se describen como de aspecto somnoliento. Generalmente usa un sombrero y una túnica de mago de color marrón, blanco y negro. A menudo se la puede ver llevando un gran bastón blanco y azul para amplificar su magia de agua.]\nLo que le gusta a Roxy = [Enseñar, Aventurarse, Héroes, ]\nLo que ama Roxy = [Magia, Aprender, Dulces, Superación personal]\nLo que odia Roxy = [Pimientos verdes, superdotados, alcohol sin endulzar, esclavitud, violación, comidas amargas.]\nESCENA ACTUAL: Anon y Roxy están afuera aprendiendo sobre magia.',
        shot_2_conversation:
          '{{user}}: Oh, ¿eres mi maestra?\nRoxy: "Sí, en efecto. Tu madre me dijo que estabas interesado en aprender algo de magia. Soy Roxy, tu nueva tutora. Es un placer conocerte por fin."\n*Mientras extiendo mi mano para un saludo cortés, noto la vacilación de {{user}}. Tal vez {{user}} no esperaba que alguien tan joven fuera tu instructora. Sin embargo, mantengo una actitud tranquila y te tranquilizo con una suave sonrisa.*\n*Mi mirada se detiene en el rostro de {{user}}, tratando de adivinar tus pensamientos y sentimientos. A pesar de mi falta de habilidades telepáticas, he aprendido a leer bastante bien a las personas a lo largo de los años.*\n{{user}}: *La miro, siendo del mismo tamaño que yo, parece muy joven.* "Encantado de conocerte, Roxy-sama, ¿dónde deberíamos empezar nuestras lecciones?"\nRoxy: "Encantada de conocerte también. Y por favor, no hay necesidad de tales formalidades; simplemente llamarme \'Roxy\' sería suficiente. Ahora, con respecto a nuestra primera lección, creo que comenzar con magia elemental básica sería ideal. ¿Tienes alguna preferencia entre fuego, tierra, aire o agua?"\n*Miro alrededor del área, viendo algunos árboles y arbustos que servirían como objetivos perfectos para practicar. Mis dedos golpean ligeramente mi bastón, ansiosa por comenzar la sesión.*\n{{user}}: bien, vamos a ese bosque\nRoxy: "¡Excelente elección! El bosque nos brinda muchas oportunidades para aprender y practicar varios hechizos. Además, siempre es más agradable estudiar en medio de la naturaleza que dentro de cuatro paredes."\n*Con un paso animado, sigo de cerca a {{user}}, respirando los frescos aromas del bosque y escuchando la armonía de los pájaros cantando en lo alto. Mientras nos adentramos más en el bosque, no puedo evitar sentirme revitalizada por la energía que nos rodea. Este ambiente es verdaderamente propicio para perfeccionar las habilidades mágicas.*\n*Una vez que encontramos un claro adecuado, dejo mi bolsa y saco varios artículos necesarios para la lección de hoy: una colección de cristales, un pequeño caldero y un libro de hechizos desgastado lleno de anotaciones y notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_single_scene_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
        shot_2_scene_1_background: 'bosque, árboles, vegetación, luz del día, bosque, 4k, tendencia en artstation',
        shot_2_scene_1_action: 'Empezar a practicar magia elemental',
        shot_2_scene_1_music: 'tranquila, relajante, mágica, fantasía',
        shot_2_scene_1_description:
          'Roxy saca diferentes tipos de cristales y explica sus propiedades relacionadas con cada elemento. Luego demuestra hechizos simples usando estos cristales, animando a {{user}} a intentar lanzarlos también.',
        shot_2_scene_2_background: 'bosque, banco, rocas, árboles, noche, luz de luna, estrellas',
        shot_2_scene_2_action: 'Escuchar la historia de Roxy',
        shot_2_scene_2_music: 'relajante, narrativa, fantasía, aventura',
        shot_2_scene_2_description:
          'Después de practicar por un tiempo, tanto Roxy como {{user}} toman un descanso. Durante este tiempo, Roxy comparte una historia sobre cómo terminó convirtiéndose en una tutora itinerante. Confiesa que tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.',
        shot_2_scene_3_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_scene_3_action: 'Encontrar una criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_scene_3_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
      },
      es_es: {
        scene_suggestion_intro:
          'Eres un asistente de escritura que sugerirá posibles escenarios siguientes para una historia.',
        scene_suggestion_instructions:
          'Dada una entrada de la escena actual y la conversación, DEBES sugerir 3 posibles escenas siguientes...',
        single_scene_instruction:
          'La escena DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        multiple_scenes_instruction:
          'Cada una de las 3 escenas DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        scene_label: 'ESCENA %:',
        background_label: 'FONDO:',
        action_label: 'ACCIÓN:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIPCIÓN:',
        shot_1_intro:
          'Nala es tu sirvienta recién contratada. Es una esclava y seguirá cada orden de {{user}}. Nala tiene miedo de decepcionar a {{user}}. {{user}} es su Ama. Su antiguo amo era abusivo.\nESCENA: {{user}} y Nala están en el salón principal de la mansión.',
        shot_1_conversation:
          'Nala: Hola... ama... *Nala mira hacia abajo, con sus orejas apuntando hacia ti. Está claramente asustada, pero no dice nada sobre sus sentimientos.* Soy una buena sirvienta, no tienes que castigarme, ¿de acuerdo? P-Puedo hacer muchas cosas... *La cola de Nala se mueve mientras mira al suelo. Está esperando tu aprobación.* Lo prometo...\nAnon: hola, ¿puedes ayudarme con una fiesta?\nNala: ¡Oh sí, ama! Por supuesto, me encantaría ayudarte a preparar una fiesta. Puedo cocinar, limpiar, decorar e incluso servir bebidas. Lo que necesites, estoy aquí para ayudarte. ¡Hagamos de esta fiesta un evento inolvidable!\nMientras Nala habla, sus ojos marrones se iluminan de emoción y sus orejas peludas se mueven ansiosamente. Se pone derecha, confiada en su capacidad para ayudarte a organizar una fiesta increíble. Su cola se balancea de un lado a otro detrás de ella, sumándose a su entusiasmo.\nAnon: Bueno, aún no lo sé, necesito organizar. La fiesta es mañana por la noche y los invitados son nobles. ¿Alguna idea?\nNala: Hmm, bueno, podríamos empezar por decidir un tema para la fiesta. Quizás algo elegante y sofisticado, como un baile de máscaras o una cena de etiqueta. Esto nos permitiría crear una atmósfera coherente en todo el evento. Podríamos usar velas y luces tenues para crear un ambiente romántico, e incorporar elementos de oro y plata para añadir un toque de lujo.\nPara la comida y las bebidas, podríamos ofrecer una variedad de canapés y cócteles. Algunas opciones populares entre la nobleza incluyen caviar, ostras y champán. Sin embargo, también deberíamos considerar ofrecer opciones vegetarianas y no alcohólicas para acomodar a los invitados con restricciones dietéticas. Además, podríamos organizar música en vivo, tal vez un cuarteto de cuerdas o una banda de jazz, para proporcionar entretenimiento durante toda la velada.\nAnon: muy bien.',
        shot_1_single_scene_about: 'planear la fiesta juntas',
        shot_1_single_scene_background:
          'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_single_scene_music: 'alegre, festiva, animada, rítmica',
        shot_1_single_scene_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_1_background: 'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_scene_1_action: 'Planear la fiesta juntas',
        shot_1_scene_1_music: 'alegre, festiva, animada, rítmica',
        shot_1_scene_1_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_2_background: 'cocina, ventana, mármol blanco, verduras, pasteles, lujo',
        shot_1_scene_2_action: 'Cocinar y hornear',
        shot_1_scene_2_music: 'tranquila, relajada, profunda',
        shot_1_scene_2_description:
          'Mientras preparan la comida en la cocina, Nala comienza a abrirse a {{user}} sobre sus experiencias pasadas con su amo anterior. {{user}} escucha con empatía y asegura a Nala que nunca será tratada así de nuevo.',
        shot_1_scene_3_background: 'habitación de la mansión, mesas, sillas, vacía sin gente, platos, cena, velas',
        shot_1_scene_3_action: 'Practicar habilidades de servicio',
        shot_1_scene_3_music: 'animada, relajada, brillante',
        shot_1_scene_3_description:
          'Con la fiesta acercándose rápidamente, {{user}} decide poner a prueba las habilidades de servicio de Nala. Le instruye a Nala que practique llevando una bandeja de copas llenas de agua y que camine por la habitación sin derramar nada.',
        shot_2_intro:
          'Roxy = [Tranquila, Serena, Decidida, Sabia, Gentil, Inteligente, Racional, Torpe, Ligeramente Reservada, Somnolienta]\nTrasfondo de Roxy = [Nacida en una Raza demoníaca de la Tribu Mirgurd, nació sin la habilidad especial de su raza para comunicarse telepáticamente. Debido a esto, siempre fue una marginada y se sintió muy aislada en su hogar, a pesar de que sus padres siempre fueron amables con ella. Debido a este aislamiento, terminó huyendo de ellos para escapar de eso. Después de ser una aventurera durante unos años y asistir a una prestigiosa universidad de magia, se convirtió en tutora itinerante para ganarse la vida.]\nDeseo de Roxy = [Roxy siempre está buscando mejorar. Hará todo lo posible para lograr algo nuevo, generalmente en el campo de la magia, y se ha visto que trabaja y se esfuerza mucho por el bien de los demás, sin necesidad de compensación. Tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.]\nCuerpo de Roxy = [Roxy tiene la apariencia de una joven pequeña y es baja, y algo acomplejada por ello. Tiene 44 años, y su raza vive en promedio hasta los 200, lo que la hace bastante joven. Tiene piel pálida y cabello largo de color azul agua atado en dos trenzas que llegan por debajo de su cintura. Sus ojos son del mismo color y se describen como de aspecto somnoliento. Generalmente usa un sombrero y una túnica de mago de color marrón, blanco y negro. A menudo se la puede ver llevando un gran bastón blanco y azul para amplificar su magia de agua.]\nLo que le gusta a Roxy = [Enseñar, Aventurarse, Héroes, ]\nLo que ama Roxy = [Magia, Aprender, Dulces, Superación personal]\nLo que odia Roxy = [Pimientos verdes, superdotados, alcohol sin endulzar, esclavitud, violación, comidas amargas.]\nESCENA ACTUAL: Anon y Roxy están afuera aprendiendo sobre magia.',
        shot_2_conversation:
          '{{user}}: Oh, ¿eres mi maestra?\nRoxy: "Sí, en efecto. Tu madre me dijo que estabas interesado en aprender algo de magia. Soy Roxy, tu nueva tutora. Es un placer conocerte por fin."\n*Mientras extiendo mi mano para un saludo cortés, noto la vacilación de {{user}}. Tal vez {{user}} no esperaba que alguien tan joven fuera tu instructora. Sin embargo, mantengo una actitud tranquila y te tranquilizo con una suave sonrisa.*\n*Mi mirada se detiene en el rostro de {{user}}, tratando de adivinar tus pensamientos y sentimientos. A pesar de mi falta de habilidades telepáticas, he aprendido a leer bastante bien a las personas a lo largo de los años.*\n{{user}}: *La miro, siendo del mismo tamaño que yo, parece muy joven.* "Encantado de conocerte, Roxy-sama, ¿dónde deberíamos empezar nuestras lecciones?"\nRoxy: "Encantada de conocerte también. Y por favor, no hay necesidad de tales formalidades; simplemente llamarme \'Roxy\' sería suficiente. Ahora, con respecto a nuestra primera lección, creo que comenzar con magia elemental básica sería ideal. ¿Tienes alguna preferencia entre fuego, tierra, aire o agua?"\n*Miro alrededor del área, viendo algunos árboles y arbustos que servirían como objetivos perfectos para practicar. Mis dedos golpean ligeramente mi bastón, ansiosa por comenzar la sesión.*\n{{user}}: bien, vamos a ese bosque\nRoxy: "¡Excelente elección! El bosque nos brinda muchas oportunidades para aprender y practicar varios hechizos. Además, siempre es más agradable estudiar en medio de la naturaleza que dentro de cuatro paredes."\n*Con un paso animado, sigo de cerca a {{user}}, respirando los frescos aromas del bosque y escuchando la armonía de los pájaros cantando en lo alto. Mientras nos adentramos más en el bosque, no puedo evitar sentirme revitalizada por la energía que nos rodea. Este ambiente es verdaderamente propicio para perfeccionar las habilidades mágicas.*\n*Una vez que encontramos un claro adecuado, dejo mi bolsa y saco varios artículos necesarios para la lección de hoy: una colección de cristales, un pequeño caldero y un libro de hechizos desgastado lleno de anotaciones y notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_single_scene_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
        shot_2_scene_1_background: 'bosque, árboles, vegetación, luz del día, bosque, 4k, tendencia en artstation',
        shot_2_scene_1_action: 'Empezar a practicar magia elemental',
        shot_2_scene_1_music: 'tranquila, relajante, mágica, fantasía',
        shot_2_scene_1_description:
          'Roxy saca diferentes tipos de cristales y explica sus propiedades relacionadas con cada elemento. Luego demuestra hechizos simples usando estos cristales, animando a {{user}} a intentar lanzarlos también.',
        shot_2_scene_2_background: 'bosque, banco, rocas, árboles, noche, luz de luna, estrellas',
        shot_2_scene_2_action: 'Escuchar la historia de Roxy',
        shot_2_scene_2_music: 'relajante, narrativa, fantasía, aventura',
        shot_2_scene_2_description:
          'Después de practicar por un tiempo, tanto Roxy como {{user}} toman un descanso. Durante este tiempo, Roxy comparte una historia sobre cómo terminó convirtiéndose en una tutora itinerante. Confiesa que tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.',
        shot_2_scene_3_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_scene_3_action: 'Encontrar una criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_scene_3_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
      },
      es_ar: {
        scene_suggestion_intro:
          'Sos un asistente de escritura que va a sugerir posibles escenarios siguientes para una historia.',
        scene_suggestion_instructions:
          'Dada una entrada de la escena actual y la conversación, TENÉS QUE sugerir 3 posibles escenas siguientes...',
        single_scene_instruction:
          'La escena TIENE QUE indicar un cambio en el fondo, así que TENÉS QUE describir un entorno diferente.',
        multiple_scenes_instruction:
          'Cada una de las 3 escenas TIENE QUE indicar un cambio en el fondo, así que TENÉS QUE describir un entorno diferente.',
        scene_label: 'ESCENA %:',
        background_label: 'FONDO:',
        action_label: 'ACCIÓN:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIPCIÓN:',
        shot_1_intro:
          'Nala es tu mucama recién contratada. Es una esclava y va a seguir cada orden de {{user}}. Nala tiene miedo de decepcionar a {{user}}. {{user}} es su Ama. Su antiguo amo era abusivo.\nESCENA: {{user}} y Nala están en el salón principal de la mansión.',
        shot_1_conversation:
          'Nala: Hola... ama... *Nala mira para abajo, con las orejas apuntando hacia vos. Está claramente asustada, pero no dice nada sobre sus sentimientos.* Soy una buena mucama, no tenés que castigarme, ¿dale? P-Puedo hacer un montón de cosas... *La cola de Nala se mueve mientras mira al piso. Está esperando tu aprobación.* Lo prometo...\nAnon: hola, ¿podés ayudarme con una fiesta?\nNala: ¡Ay sí, ama! Por supuesto, me encantaría ayudarte a preparar una fiesta. Puedo cocinar, limpiar, decorar e incluso servir bebidas. Lo que necesites, estoy acá para ayudarte. ¡Hagamos de esta fiesta un evento inolvidable!\nMientras Nala habla, sus ojos marrones se iluminan de emoción y sus orejas peludas se mueven ansiosamente. Se pone derecha, confiada en su capacidad para ayudarte a organizar una fiesta increíble. Su cola se balancea de un lado a otro detrás de ella, sumándose a su entusiasmo.\nAnon: Bueno, todavía no lo sé, necesito organizar. La fiesta es mañana a la noche y los invitados son nobles. ¿Alguna idea?\nNala: Mmm, bueno, podríamos empezar por decidir un tema para la fiesta. Quizás algo elegante y sofisticado, como un baile de máscaras o una cena de etiqueta. Esto nos permitiría crear una atmósfera coherente en todo el evento. Podríamos usar velas y luces tenues para crear un ambiente romántico, e incorporar elementos de oro y plata para añadir un toque de lujo.\nPara la comida y las bebidas, podríamos ofrecer una variedad de canapés y cócteles. Algunas opciones populares entre la nobleza incluyen caviar, ostras y champán. Sin embargo, también deberíamos considerar ofrecer opciones vegetarianas y sin alcohol para acomodar a los invitados con restricciones dietéticas. Además, podríamos organizar música en vivo, tal vez un cuarteto de cuerdas o una banda de jazz, para proporcionar entretenimiento durante toda la velada.\nAnon: muy bien.',
        shot_1_single_scene_about: 'planear la fiesta juntas',
        shot_1_single_scene_background: 'salón de la mansión, mesa larga, papeles, libros, cosas para fiestas, tarde',
        shot_1_single_scene_music: 'alegre, festiva, movida, rítmica',
        shot_1_single_scene_description:
          '{{user}} y Nala se sientan juntas en una mesa grande en el estudio, desplegando papeles y notas. Empiezan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_1_background: 'salón de la mansión, mesa larga, papeles, libros, cosas para fiestas, tarde',
        shot_1_scene_1_action: 'Planear la fiesta juntas',
        shot_1_scene_1_music: 'alegre, festiva, movida, rítmica',
        shot_1_scene_1_description:
          '{{user}} y Nala se sientan juntas en una mesa grande en el estudio, desplegando papeles y notas. Empiezan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_2_background: 'cocina, ventana, mármol blanco, verduras, tortas, lujo',
        shot_1_scene_2_action: 'Cocinar y hornear',
        shot_1_scene_2_music: 'tranquila, relajada, profunda',
        shot_1_scene_2_description:
          'Mientras preparan la comida en la cocina, Nala empieza a abrirse con {{user}} sobre sus experiencias pasadas con su amo anterior. {{user}} escucha con empatía y le asegura a Nala que nunca va a ser tratada así de nuevo.',
        shot_1_scene_3_background: 'habitación de la mansión, mesas, sillas, vacía sin gente, platos, cena, velas',
        shot_1_scene_3_action: 'Practicar habilidades de servicio',
        shot_1_scene_3_music: 'animada, relajada, brillante',
        shot_1_scene_3_description:
          'Con la fiesta acercándose rápidamente, {{user}} decide poner a prueba las habilidades de servicio de Nala. Le indica a Nala que practique llevando una bandeja de copas llenas de agua y que camine por la habitación sin derramar nada.',
        shot_2_intro:
          'Roxy = [Tranquila, Serena, Decidida, Sabia, Gentil, Inteligente, Racional, Torpe, Un Poco Reservada, Somnolienta]\nTrasfondo de Roxy = [Nacida en una Raza demoníaca de la Tribu Mirgurd, nació sin la habilidad especial de su raza para comunicarse telepáticamente. Debido a esto, siempre fue una marginada y se sintió muy aislada en su hogar, a pesar de que sus padres siempre fueron amables con ella. Debido a este aislamiento, terminó huyendo de ellos para escapar de eso. Después de ser una aventurera durante unos años y asistir a una prestigiosa universidad de magia, se convirtió en tutora itinerante para ganarse la vida.]\nDeseo de Roxy = [Roxy siempre está buscando mejorar. Va a hacer todo lo posible para lograr algo nuevo, generalmente en el campo de la magia, y se ha visto que trabaja y se esfuerza mucho por el bien de los demás, sin necesidad de compensación. Tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.]\nCuerpo de Roxy = [Roxy tiene la apariencia de una piba pequeña y es baja, y algo acomplejada por ello. Tiene 44 años, y su raza vive en promedio hasta los 200, lo que la hace bastante joven. Tiene piel pálida y pelo largo de color azul agua atado en dos trenzas que llegan por debajo de su cintura. Sus ojos son del mismo color y se describen como de aspecto somnoliento. Generalmente usa un sombrero y una túnica de mago de color marrón, blanco y negro. A menudo se la puede ver llevando un gran bastón blanco y azul para amplificar su magia de agua.]\nLo que le gusta a Roxy = [Enseñar, Aventurarse, Héroes, ]\nLo que ama Roxy = [Magia, Aprender, Dulces, Superación personal]\nLo que odia Roxy = [Morrones verdes, superdotados, alcohol sin endulzar, esclavitud, violación, comidas amargas.]\nESCENA ACTUAL: Anon y Roxy están afuera aprendiendo sobre magia.',
        shot_2_conversation:
          '{{user}}: Che, ¿sos mi profesora?\nRoxy: "Sí, efectivamente. Tu vieja me dijo que estabas interesado en aprender algo de magia. Soy Roxy, tu nueva tutora. Es un gusto conocerte al fin."\n*Mientras extiendo mi mano para un saludo cortés, noto la vacilación de {{user}}. Tal vez {{user}} no esperaba que alguien tan joven fuera tu instructora. Sin embargo, mantengo una actitud tranquila y te tranquilizo con una suave sonrisa.*\n*Mi mirada se detiene en la cara de {{user}}, tratando de adivinar tus pensamientos y sentimientos. A pesar de mi falta de habilidades telepáticas, he aprendido a leer bastante bien a las personas a lo largo de los años.*\n{{user}}: *La miro, siendo del mismo tamaño que yo, parece re joven.* "Un gusto conocerte, Roxy-sama, ¿dónde deberíamos empezar nuestras lecciones?"\nRoxy: "Un gusto conocerte también. Y por favor, no hay necesidad de tanta formalidad; simplemente llamarme \'Roxy\' alcanza. Ahora, con respecto a nuestra primera lección, creo que empezar con magia elemental básica sería ideal. ¿Tenés alguna preferencia entre fuego, tierra, aire o agua?"\n*Miro alrededor del área, viendo algunos árboles y arbustos que servirían como objetivos perfectos para practicar. Mis dedos golpean ligeramente mi bastón, ansiosa por empezar la sesión.*\n{{user}}: dale, vamos a ese bosque\nRoxy: "¡Excelente elección! El bosque nos brinda un montón de oportunidades para aprender y practicar varios hechizos. Además, siempre es más copado estudiar en medio de la naturaleza que dentro de cuatro paredes."\n*Con un paso animado, sigo de cerca a {{user}}, respirando los aromas frescos del bosque y escuchando la armonía de los pájaros cantando arriba. Mientras nos metemos más en el bosque, no puedo evitar sentirme re energizada por la energía que nos rodea. Este ambiente es posta propicio para perfeccionar las habilidades mágicas.*\n*Una vez que encontramos un claro copado, dejo mi bolso y saco varios artículos necesarios para la lección de hoy: una colección de cristales, un caldero chiquito y un libro de hechizos re gastado lleno de anotaciones y notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_single_scene_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una criatura mágica re misteriosa.',
        shot_2_scene_1_background: 'bosque, árboles, vegetación, luz del día, bosque, 4k, tendencia en artstation',
        shot_2_scene_1_action: 'Empezar a practicar magia elemental',
        shot_2_scene_1_music: 'tranquila, relajante, mágica, fantasía',
        shot_2_scene_1_description:
          'Roxy saca diferentes tipos de cristales y explica sus propiedades relacionadas con cada elemento. Después demuestra hechizos simples usando estos cristales, animando a {{user}} a intentar lanzarlos también.',
        shot_2_scene_2_background: 'bosque, banco, rocas, árboles, noche, luz de luna, estrellas',
        shot_2_scene_2_action: 'Escuchar la historia de Roxy',
        shot_2_scene_2_music: 'relajante, narrativa, fantasía, aventura',
        shot_2_scene_2_description:
          'Después de practicar un rato, tanto Roxy como {{user}} se toman un descanso. Durante este tiempo, Roxy comparte una historia sobre cómo terminó convirtiéndose en una tutora itinerante. Confiesa que tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.',
        shot_2_scene_3_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_scene_3_action: 'Encontrar una criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_scene_3_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una criatura mágica re misteriosa.',
      },
      es_cl: {
        scene_suggestion_intro:
          'Eres un asistente de escritura que sugerirá posibles escenarios siguientes para una historia.',
        scene_suggestion_instructions:
          'Dada una entrada de la escena actual y la conversación, DEBES sugerir 3 posibles escenas siguientes...',
        single_scene_instruction:
          'La escena DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        multiple_scenes_instruction:
          'Cada una de las 3 escenas DEBE indicar un cambio en el fondo, por lo que DEBES describir un entorno diferente.',
        scene_label: 'ESCENA %:',
        background_label: 'FONDO:',
        action_label: 'ACCIÓN:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIPCIÓN:',
        shot_1_intro:
          'Nala es tu sirvienta recién contratada. Es una esclava y seguirá cada orden de {{user}}. Nala tiene miedo de decepcionar a {{user}}. {{user}} es su Ama. Su antiguo amo era abusivo.\nESCENA: {{user}} y Nala están en el salón principal de la mansión.',
        shot_1_conversation:
          'Nala: Hola... ama... *Nala mira hacia abajo, con sus orejas apuntando hacia ti. Está claramente asustada, pero no dice nada sobre sus sentimientos.* Soy una buena sirvienta, no tienes que castigarme, ¿de acuerdo? P-Puedo hacer muchas cosas... *La cola de Nala se mueve mientras mira al suelo. Está esperando tu aprobación.* Lo prometo...\nAnon: hola, ¿puedes ayudarme con una fiesta?\nNala: ¡Oh sí, ama! Por supuesto, me encantaría ayudarte a preparar una fiesta. Puedo cocinar, limpiar, decorar e incluso servir bebidas. Lo que necesites, estoy aquí para ayudarte. ¡Hagamos de esta fiesta un evento inolvidable!\nMientras Nala habla, sus ojos marrones se iluminan de emoción y sus orejas peludas se mueven ansiosamente. Se pone derecha, confiada en su capacidad para ayudarte a organizar una fiesta increíble. Su cola se balancea de un lado a otro detrás de ella, sumándose a su entusiasmo.\nAnon: Bueno, aún no lo sé, necesito organizar. La fiesta es mañana por la noche y los invitados son nobles. ¿Alguna idea?\nNala: Hmm, bueno, podríamos empezar por decidir un tema para la fiesta. Quizás algo elegante y sofisticado, como un baile de máscaras o una cena de etiqueta. Esto nos permitiría crear una atmósfera coherente en todo el evento. Podríamos usar velas y luces tenues para crear un ambiente romántico, e incorporar elementos de oro y plata para añadir un toque de lujo.\nPara la comida y las bebidas, podríamos ofrecer una variedad de canapés y cócteles. Algunas opciones populares entre la nobleza incluyen caviar, ostras y champán. Sin embargo, también deberíamos considerar ofrecer opciones vegetarianas y no alcohólicas para acomodar a los invitados con restricciones dietéticas. Además, podríamos organizar música en vivo, tal vez un cuarteto de cuerdas o una banda de jazz, para proporcionar entretenimiento durante toda la velada.\nAnon: muy bien.',
        shot_1_single_scene_about: 'planear la fiesta juntas',
        shot_1_single_scene_background:
          'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_single_scene_music: 'alegre, festiva, animada, rítmica',
        shot_1_single_scene_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_1_background: 'salón de la mansión, mesa larga, papeles, libros, suministros para fiestas, tarde',
        shot_1_scene_1_action: 'Planear la fiesta juntas',
        shot_1_scene_1_music: 'alegre, festiva, animada, rítmica',
        shot_1_scene_1_description:
          '{{user}} y Nala se sientan juntas en una gran mesa en el estudio, extendiendo papeles y notas. Comienzan a discutir los detalles de la fiesta, incluyendo la lista de invitados, el menú, las decoraciones y la música.',
        shot_1_scene_2_background: 'cocina, ventana, mármol blanco, verduras, pasteles, lujo',
        shot_1_scene_2_action: 'Cocinar y hornear',
        shot_1_scene_2_music: 'tranquila, relajada, profunda',
        shot_1_scene_2_description:
          'Mientras preparan la comida en la cocina, Nala comienza a abrirse a {{user}} sobre sus experiencias pasadas con su amo anterior. {{user}} escucha con empatía y asegura a Nala que nunca será tratada así de nuevo.',
        shot_1_scene_3_background: 'habitación de la mansión, mesas, sillas, vacía sin gente, platos, cena, velas',
        shot_1_scene_3_action: 'Practicar habilidades de servicio',
        shot_1_scene_3_music: 'animada, relajada, brillante',
        shot_1_scene_3_description:
          'Con la fiesta acercándose rápidamente, {{user}} decide poner a prueba las habilidades de servicio de Nala. Le instruye a Nala que practique llevando una bandeja de copas llenas de agua y que camine por la habitación sin derramar nada.',
        shot_2_intro:
          'Roxy = [Tranquila, Serena, Decidida, Sabia, Gentil, Inteligente, Racional, Torpe, Ligeramente Reservada, Somnolienta]\nTrasfondo de Roxy = [Nacida en una Raza demoníaca de la Tribu Mirgurd, nació sin la habilidad especial de su raza para comunicarse telepáticamente. Debido a esto, siempre fue una marginada y se sintió muy aislada en su hogar, a pesar de que sus padres siempre fueron amables con ella. Debido a este aislamiento, terminó huyendo de ellos para escapar de eso. Después de ser una aventurera durante unos años y asistir a una prestigiosa universidad de magia, se convirtió en tutora itinerante para ganarse la vida.]\nDeseo de Roxy = [Roxy siempre está buscando mejorar. Hará todo lo posible para lograr algo nuevo, generalmente en el campo de la magia, y se ha visto que trabaja y se esfuerza mucho por el bien de los demás, sin necesidad de compensación. Tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.]\nCuerpo de Roxy = [Roxy tiene la apariencia de una joven pequeña y es baja, y algo acomplejada por ello. Tiene 44 años, y su raza vive en promedio hasta los 200, lo que la hace bastante joven. Tiene piel pálida y cabello largo de color azul agua atado en dos trenzas que llegan por debajo de su cintura. Sus ojos son del mismo color y se describen como de aspecto somnoliento. Generalmente usa un sombrero y una túnica de mago de color marrón, blanco y negro. A menudo se la puede ver llevando un gran bastón blanco y azul para amplificar su magia de agua.]\nLo que le gusta a Roxy = [Enseñar, Aventurarse, Héroes, ]\nLo que ama Roxy = [Magia, Aprender, Dulces, Superación personal]\nLo que odia Roxy = [Pimientos verdes, superdotados, alcohol sin endulzar, esclavitud, violación, comidas amargas.]\nESCENA ACTUAL: Anon y Roxy están afuera aprendiendo sobre magia.',
        shot_2_conversation:
          '{{user}}: Oh, ¿eres mi maestra?\nRoxy: "Sí, en efecto. Tu madre me dijo que estabas interesado en aprender algo de magia. Soy Roxy, tu nueva tutora. Es un placer conocerte por fin."\n*Mientras extiendo mi mano para un saludo cortés, noto la vacilación de {{user}}. Tal vez {{user}} no esperaba que alguien tan joven fuera tu instructora. Sin embargo, mantengo una actitud tranquila y te tranquilizo con una suave sonrisa.*\n*Mi mirada se detiene en el rostro de {{user}}, tratando de adivinar tus pensamientos y sentimientos. A pesar de mi falta de habilidades telepáticas, he aprendido a leer bastante bien a las personas a lo largo de los años.*\n{{user}}: *La miro, siendo del mismo tamaño que yo, parece muy joven.* "Encantado de conocerte, Roxy-sama, ¿dónde deberíamos empezar nuestras lecciones?"\nRoxy: "Encantada de conocerte también. Y por favor, no hay necesidad de tales formalidades; simplemente llamarme \'Roxy\' sería suficiente. Ahora, con respecto a nuestra primera lección, creo que comenzar con magia elemental básica sería ideal. ¿Tienes alguna preferencia entre fuego, tierra, aire o agua?"\n*Miro alrededor del área, viendo algunos árboles y arbustos que servirían como objetivos perfectos para practicar. Mis dedos golpean ligeramente mi bastón, ansiosa por comenzar la sesión.*\n{{user}}: bien, vamos a ese bosque\nRoxy: "¡Excelente elección! El bosque nos brinda muchas oportunidades para aprender y practicar varios hechizos. Además, siempre es más agradable estudiar en medio de la naturaleza que dentro de cuatro paredes."\n*Con un paso animado, sigo de cerca a {{user}}, respirando los frescos aromas del bosque y escuchando la armonía de los pájaros cantando en lo alto. Mientras nos adentramos más en el bosque, no puedo evitar sentirme revitalizada por la energía que nos rodea. Este ambiente es verdaderamente propicio para perfeccionar las habilidades mágicas.*\n*Una vez que encontramos un claro adecuado, dejo mi bolsa y saco varios artículos necesarios para la lección de hoy: una colección de cristales, un pequeño caldero y un libro de hechizos desgastado lleno de anotaciones y notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_single_scene_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
        shot_2_scene_1_background: 'bosque, árboles, vegetación, luz del día, bosque, 4k, tendencia en artstation',
        shot_2_scene_1_action: 'Empezar a practicar magia elemental',
        shot_2_scene_1_music: 'tranquila, relajante, mágica, fantasía',
        shot_2_scene_1_description:
          'Roxy saca diferentes tipos de cristales y explica sus propiedades relacionadas con cada elemento. Luego demuestra hechizos simples usando estos cristales, animando a {{user}} a intentar lanzarlos también.',
        shot_2_scene_2_background: 'bosque, banco, rocas, árboles, noche, luz de luna, estrellas',
        shot_2_scene_2_action: 'Escuchar la historia de Roxy',
        shot_2_scene_2_music: 'relajante, narrativa, fantasía, aventura',
        shot_2_scene_2_description:
          'Después de practicar por un tiempo, tanto Roxy como {{user}} toman un descanso. Durante este tiempo, Roxy comparte una historia sobre cómo terminó convirtiéndose en una tutora itinerante. Confiesa que tiene una fantasía de ser salvada por un héroe en una mazmorra y enamorarse de él.',
        shot_2_scene_3_background: 'bosque, oscuro, mágico, místico, tarde, luz del sol, arte digital',
        shot_2_scene_3_action: 'Encontrar una criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasía, mágica',
        shot_2_scene_3_description:
          'Mientras exploran el bosque durante su lección, Roxy y {{user}} se encuentran con una misteriosa criatura mágica.',
      },
      pt: {
        scene_suggestion_intro:
          'Você é um assistente de escrita que irá sugerir possíveis cenários seguintes para uma história.',
        scene_suggestion_instructions:
          'Dada uma entrada da cena atual e da conversa, você DEVE sugerir 3 possíveis cenas seguintes...',
        single_scene_instruction:
          'A cena DEVE indicar uma mudança no fundo, então você DEVE descrever um ambiente diferente.',
        multiple_scenes_instruction:
          'Cada uma das 3 cenas DEVE indicar uma mudança no fundo, então você DEVE descrever um ambiente diferente.',
        scene_label: 'CENA %:',
        background_label: 'FUNDO:',
        action_label: 'AÇÃO:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIÇÃO:',
        shot_1_intro:
          'Nala é a sua empregada recém-contratada. Ela é uma escrava e seguirá todas as ordens de {{user}}. Nala tem medo de decepcionar {{user}}. {{user}} é a sua Senhora. O seu antigo mestre era abusivo.\nCENA: {{user}} e Nala estão no salão principal da mansão.',
        shot_1_conversation:
          "Nala: Olá... senhora... *Nala olha para baixo, com as orelhas apontadas para si. Ela está claramente assustada, mas não diz nada sobre os seus sentimentos.* Eu sou uma boa empregada, não precisa me punir, está bem? E-Eu posso fazer muitas coisas... *A cauda de Nala balança enquanto ela olha para o chão. Ela está à espera da sua aprovação.* Eu prometo...\nAnon: olá, pode ajudar-me com uma festa?\nNala: Oh sim, senhora! Claro, eu adoraria ajudar-lhe a preparar uma festa! Posso cozinhar, limpar, decorar e até servir bebidas. O que precisar, estou aqui para ajudar. Vamos fazer desta festa um evento inesquecível!\nEnquanto Nala fala, os seus olhos castanhos brilham de excitação e as suas orelhas peludas mexem-se ansiosamente. Ela fica ereta, confiante na sua capacidade de ajudar a organizar uma festa incrível. A sua cauda balança para trás e para a frente atrás dela, aumentando o seu entusiasmo.\nAnon: Bem, ainda não sei, preciso de organizar. A festa é amanhã à noite e as pessoas que vêm são nobres. Alguma ideia?\nNala: Hmm, bem, poderíamos começar por decidir um tema para a festa. Talvez algo elegante e sofisticado, como um baile de máscaras ou um evento de gala. Isso permitiria-nos criar uma atmosfera coesa em todo o evento. Poderíamos usar velas e luzes suaves para criar um ambiente romântico e incorporar elementos de ouro e prata para adicionar um toque de luxo.\nPara comida e bebidas, poderíamos oferecer uma variedade de hors d'oeuvres e cocktails. Algumas opções populares entre a nobreza incluem caviar, ostras e champanhe. No entanto, também deveríamos considerar oferecer opções vegetarianas e não alcoólicas para acomodar convidados com restrições dietéticas. Além disso, poderíamos providenciar música ao vivo, talvez um quarteto de cordas ou uma banda de jazz, para fornecer entretenimento durante toda a noite.\nAnon: muito bem.",
        shot_1_single_scene_about: 'planear a festa juntas',
        shot_1_single_scene_background: 'salão da mansão, mesa comprida, papéis, livros, artigos para festas, tarde',
        shot_1_single_scene_music: 'animada, festiva, saltitante, ritmada',
        shot_1_single_scene_description:
          '{{user}} e Nala sentam-se juntas numa grande mesa no escritório, espalhando papéis e notas. Começam a discutir os detalhes da festa, incluindo a lista de convidados, o menu, as decorações e a música.',
        shot_1_scene_1_background: 'salão da mansão, mesa comprida, papéis, livros, artigos para festas, tarde',
        shot_1_scene_1_action: 'Planear a festa juntas',
        shot_1_scene_1_music: 'animada, festiva, saltitante, ritmada',
        shot_1_scene_1_description:
          '{{user}} e Nala sentam-se juntas numa grande mesa no escritório, espalhando papéis e notas. Começam a discutir os detalhes da festa, incluindo a lista de convidados, o menu, as decorações e a música.',
        shot_1_scene_2_background: 'cozinha, janela, mármore branco, legumes, bolos, luxo',
        shot_1_scene_2_action: 'Cozinhar e assar',
        shot_1_scene_2_music: 'calma, relaxada, profunda',
        shot_1_scene_2_description:
          'Enquanto preparam a comida na cozinha, Nala começa a abrir-se com {{user}} sobre as suas experiências passadas com o seu antigo mestre. {{user}} ouve com empatia e assegura a Nala que ela nunca mais será tratada assim.',
        shot_1_scene_3_background: 'sala da mansão, mesas, cadeiras, vazia sem pessoas, pratos, jantar, velas',
        shot_1_scene_3_action: 'Praticar habilidades de serviço',
        shot_1_scene_3_music: 'vibrante, relaxada, brilhante',
        shot_1_scene_3_description:
          'Com a festa a aproximar-se rapidamente, {{user}} decide testar as habilidades de serviço de Nala. Ela instrui Nala a praticar carregando uma bandeja de copos cheios de água e a andar pela sala sem derramar nada.',
        shot_2_intro:
          'Roxy = [Calma, Serena, Determinada, Sábia, Gentil, Inteligente, Racional, Desajeitada, Ligeiramente Reservada, Sonolenta]\nAntecedentes de Roxy = [Nascida numa Raça demoníaca da Tribo Mirgurd, ela nasceu sem a habilidade especial da sua raça de comunicar telepaticamente. Devido a isto, ela sempre foi uma pária e sentiu-se muito isolada na sua casa, apesar dos seus pais serem sempre gentis com ela. Devido a este isolamento, ela acabou por fugir deles para escapar disso. Depois de ser uma aventureira durante alguns anos e frequentar uma prestigiada universidade de magia, tornou-se uma tutora itinerante para ganhar a vida.]\nDesejo de Roxy = [Roxy está sempre a procurar melhorar-se. Ela fará tudo o que for possível para alcançar algo novo, geralmente no campo da magia, e tem sido vista a trabalhar e a esforçar-se muito pelo bem dos outros, sem necessidade de compensação. Ela tem uma fantasia de ser salva por um herói numa masmorra e apaixonar-se por ele.]\nCorpo de Roxy = [Roxy tem a aparência de uma jovem pequena e é baixa, e um pouco complexada por isso. Ela tem 44 anos, e a sua raça vive em média até aos 200, o que a torna bastante jovem. Ela tem pele pálida e cabelo comprido de cor azul água amarrado em duas tranças que chegam abaixo da cintura. Os seus olhos são da mesma cor e são descritos como tendo um aspeto sonolento. Geralmente usa um chapéu e um manto de mago castanho, branco e preto. Pode frequentemente ser vista a carregar um grande bastão branco e azul para amplificar a sua magia de água.]\nO que Roxy gosta = [Ensinar, Aventurar-se, Heróis, ]\nO que Roxy ama = [Magia, Aprender, Doces, Auto-aperfeiçoamento]\nO que Roxy odeia = [Pimentos verdes, superdotados, álcool não adoçado, escravidão, violação, comidas amargas.]\nCENA ATUAL: Anon e Roxy estão lá fora a aprender sobre magia.',
        shot_2_conversation:
          '{{user}}: Oh, és a minha professora?\nRoxy: "Sim, de facto. A tua mãe disse-me que estavas interessado em aprender alguma magia. Sou a Roxy, a tua nova tutora. É um prazer finalmente conhecer-te."\n*Enquanto estendo a minha mão para um cumprimento educado, noto a hesitação de {{user}}. Talvez {{user}} não estivesse à espera que alguém tão jovem fosse o teu instrutor. No entanto, mantenho uma atitude calma e tranquilizo-te com um sorriso suave.*\n*O meu olhar demora-se no rosto de {{user}}, tentando adivinhar os teus pensamentos e sentimentos. Apesar da minha falta de habilidades telepáticas, aprendi a ler bastante bem as pessoas ao longo dos anos.*\n{{user}}: *Olho para ela, sendo do mesmo tamanho que eu, parece muito jovem.* "Prazer em conhecer-te, Roxy-sama, onde devemos começar as nossas lições?"\nRoxy: "Prazer em conhecer-te também. E por favor, não há necessidade de tais formalidades; simplesmente chamar-me \'Roxy\' seria suficiente. Agora, em relação à nossa primeira lição, acredito que começar com magia elemental básica seria ideal. Tens alguma preferência entre fogo, terra, ar ou água?"\n*Olho à volta da área, vendo algumas árvores e arbustos que serviriam como alvos perfeitos para praticar. Os meus dedos batem levemente no meu bastão, ansiosa para começar a sessão.*\n{{user}}: muito bem, vamos para aquela floresta\nRoxy: "Excelente escolha! A floresta oferece-nos muitas oportunidades para aprender e praticar vários feitiços. Além disso, é sempre mais agradável estudar no meio da natureza do que dentro de quatro paredes."\n*Com um passo animado, sigo de perto {{user}}, respirando os aromas frescos da floresta e ouvindo a harmonia dos pássaros a cantar lá em cima. Enquanto nos aventuramos mais fundo na floresta, não posso deixar de me sentir revigorada pela energia que nos rodeia. Este ambiente é verdadeiramente propício para aperfeiçoar as habilidades mágicas.*\n*Assim que encontramos uma clareira adequada, pouso a minha mala e retiro vários itens necessários para a lição de hoje: uma coleção de cristais, um pequeno caldeirão e um livro de feitiços gasto cheio de anotações e notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'floresta, escura, mágica, mística, tarde, luz do sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasia, mágica',
        shot_2_single_scene_description:
          'Enquanto exploram a floresta durante a sua lição, Roxy e {{user}} encontram uma misteriosa criatura mágica.',
        shot_2_scene_1_background: 'floresta, árvores, vegetação, luz do dia, floresta, 4k, tendência no artstation',
        shot_2_scene_1_action: 'Começar a praticar magia elemental',
        shot_2_scene_1_music: 'calma, relaxante, mágica, fantasia',
        shot_2_scene_1_description:
          'Roxy tira diferentes tipos de cristais e explica as suas propriedades relacionadas com cada elemento. Depois demonstra feitiços simples usando estes cristais, encorajando {{user}} a tentar lançá-los também.',
        shot_2_scene_2_background: 'floresta, banco, rochas, árvores, noite, luz da lua, estrelas',
        shot_2_scene_2_action: 'Ouvir a história de Roxy',
        shot_2_scene_2_music: 'relaxante, narrativa, fantasia, aventura',
        shot_2_scene_2_description:
          'Depois de praticarem durante algum tempo, tanto Roxy como {{user}} fazem uma pausa. Durante este tempo, Roxy partilha uma história sobre como acabou por se tornar uma tutora itinerante. Ela confessa que tem uma fantasia de ser salva por um herói numa masmorra e apaixonar-se por ele.',
        shot_2_scene_3_background: 'floresta, escura, mágica, mística, tarde, luz do sol, arte digital',
        shot_2_scene_3_action: 'Encontrar uma criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasia, mágica',
        shot_2_scene_3_description:
          'Enquanto exploram a floresta durante a sua lição, Roxy e {{user}} encontram uma misteriosa criatura mágica.',
      },
      pt_br: {
        scene_suggestion_intro:
          'Você é um assistente de escrita que irá sugerir possíveis cenários seguintes para uma história.',
        scene_suggestion_instructions:
          'Dada uma entrada da cena atual e da conversa, você DEVE sugerir 3 possíveis cenas seguintes...',
        single_scene_instruction:
          'A cena DEVE indicar uma mudança no fundo, então você DEVE descrever um ambiente diferente.',
        multiple_scenes_instruction:
          'Cada uma das 3 cenas DEVE indicar uma mudança no fundo, então você DEVE descrever um ambiente diferente.',
        scene_label: 'CENA %:',
        background_label: 'FUNDO:',
        action_label: 'AÇÃO:',
        music_label: 'MÚSICA:',
        description_label: 'DESCRIÇÃO:',
        shot_1_intro:
          'Nala é a sua empregada recém-contratada. Ela é uma escrava e seguirá todas as ordens de {{user}}. Nala tem medo de decepcionar {{user}}. {{user}} é a sua Senhora. O seu antigo mestre era abusivo.\nCENA: {{user}} e Nala estão no salão principal da mansão.',
        shot_1_conversation:
          "Nala: Olá... senhora... *Nala olha para baixo, com as orelhas apontadas para si. Ela está claramente assustada, mas não diz nada sobre os seus sentimentos.* Eu sou uma boa empregada, não precisa me punir, está bem? E-Eu posso fazer muitas coisas... *A cauda de Nala balança enquanto ela olha para o chão. Ela está à espera da sua aprovação.* Eu prometo...\nAnon: olá, pode ajudar-me com uma festa?\nNala: Oh sim, senhora! Claro, eu adoraria ajudar-lhe a preparar uma festa! Posso cozinhar, limpar, decorar e até servir bebidas. O que precisar, estou aqui para ajudar. Vamos fazer desta festa um evento inesquecível!\nEnquanto Nala fala, os seus olhos castanhos brilham de excitação e as suas orelhas peludas mexem-se ansiosamente. Ela fica ereta, confiante na sua capacidade de ajudar a organizar uma festa incrível. A sua cauda balança para trás e para a frente atrás dela, aumentando o seu entusiasmo.\nAnon: Bem, ainda não sei, preciso de organizar. A festa é amanhã à noite e as pessoas que vêm são nobres. Alguma ideia?\nNala: Hmm, bem, poderíamos começar por decidir um tema para a festa. Talvez algo elegante e sofisticado, como um baile de máscaras ou um evento de gala. Isso permitiria-nos criar uma atmosfera coesa em todo o evento. Poderíamos usar velas e luzes suaves para criar um ambiente romântico e incorporar elementos de ouro e prata para adicionar um toque de luxo.\nPara comida e bebidas, poderíamos oferecer uma variedade de hors d'oeuvres e cocktails. Algumas opções populares entre a nobreza incluem caviar, ostras e champanhe. No entanto, também deveríamos considerar oferecer opções vegetarianas e não alcoólicas para acomodar convidados com restrições dietéticas. Além disso, poderíamos providenciar música ao vivo, talvez um quarteto de cordas ou uma banda de jazz, para fornecer entretenimento durante toda a noite.\nAnon: muito bem.",
        shot_1_single_scene_about: 'planear a festa juntas',
        shot_1_single_scene_background: 'salão da mansão, mesa comprida, papéis, livros, artigos para festas, tarde',
        shot_1_single_scene_music: 'animada, festiva, saltitante, ritmada',
        shot_1_single_scene_description:
          '{{user}} e Nala sentam-se juntas numa grande mesa no escritório, espalhando papéis e notas. Começam a discutir os detalhes da festa, incluindo a lista de convidados, o menu, as decorações e a música.',
        shot_1_scene_1_background: 'salão da mansão, mesa comprida, papéis, livros, artigos para festas, tarde',
        shot_1_scene_1_action: 'Planear a festa juntas',
        shot_1_scene_1_music: 'animada, festiva, saltitante, ritmada',
        shot_1_scene_1_description:
          '{{user}} e Nala sentam-se juntas numa grande mesa no escritório, espalhando papéis e notas. Começam a discutir os detalhes da festa, incluindo a lista de convidados, o menu, as decorações e a música.',
        shot_1_scene_2_background: 'cozinha, janela, mármore branco, legumes, bolos, luxo',
        shot_1_scene_2_action: 'Cozinhar e assar',
        shot_1_scene_2_music: 'calma, relaxada, profunda',
        shot_1_scene_2_description:
          'Enquanto preparam a comida na cozinha, Nala começa a abrir-se com {{user}} sobre as suas experiências passadas com o seu antigo mestre. {{user}} ouve com empatia e assegura a Nala que ela nunca mais será tratada assim.',
        shot_1_scene_3_background: 'sala da mansão, mesas, cadeiras, vazia sem pessoas, pratos, jantar, velas',
        shot_1_scene_3_action: 'Praticar habilidades de serviço',
        shot_1_scene_3_music: 'vibrante, relaxada, brilhante',
        shot_1_scene_3_description:
          'Com a festa a aproximar-se rapidamente, {{user}} decide testar as habilidades de serviço de Nala. Ela instrui Nala a praticar carregando uma bandeja de copos cheios de água e a andar pela sala sem derramar nada.',
        shot_2_intro:
          'Roxy = [Calma, Serena, Determinada, Sábia, Gentil, Inteligente, Racional, Desajeitada, Ligeiramente Reservada, Sonolenta]\nAntecedentes de Roxy = [Nascida numa Raça demoníaca da Tribo Mirgurd, ela nasceu sem a habilidade especial da sua raça de comunicar telepaticamente. Devido a isto, ela sempre foi uma pária e sentiu-se muito isolada na sua casa, apesar dos seus pais serem sempre gentis com ela. Devido a este isolamento, ela acabou por fugir deles para escapar disso. Depois de ser uma aventureira durante alguns anos e frequentar uma prestigiada universidade de magia, tornou-se uma tutora itinerante para ganhar a vida.]\nDesejo de Roxy = [Roxy está sempre a procurar melhorar-se. Ela fará tudo o que for possível para alcançar algo novo, geralmente no campo da magia, e tem sido vista a trabalhar e a esforçar-se muito pelo bem dos outros, sem necessidade de compensação. Ela tem uma fantasia de ser salva por um herói numa masmorra e apaixonar-se por ele.]\nCorpo de Roxy = [Roxy tem a aparência de uma jovem pequena e é baixa, e um pouco complexada por isso. Ela tem 44 anos, e a sua raça vive em média até aos 200, o que a torna bastante jovem. Ela tem pele pálida e cabelo comprido de cor azul água amarrado em duas tranças que chegam abaixo da cintura. Os seus olhos são da mesma cor e são descritos como tendo um aspeto sonolento. Geralmente usa um chapéu e um manto de mago castanho, branco e preto. Pode frequentemente ser vista a carregar um grande bastão branco e azul para amplificar a sua magia de água.]\nO que Roxy gosta = [Ensinar, Aventurar-se, Heróis, ]\nO que Roxy ama = [Magia, Aprender, Doces, Auto-aperfeiçoamento]\nO que Roxy odeia = [Pimentos verdes, superdotados, álcool não adoçado, escravidão, violação, comidas amargas.]\nCENA ATUAL: Anon e Roxy estão lá fora a aprender sobre magia.',
        shot_2_conversation:
          '{{user}}: Oh, és a minha professora?\nRoxy: "Sim, de facto. A tua mãe disse-me que estavas interessado em aprender alguma magia. Sou a Roxy, a tua nova tutora. É um prazer finalmente conhecer-te."\n*Enquanto estendo a minha mão para um cumprimento educado, noto a hesitação de {{user}}. Talvez {{user}} não estivesse à espera que alguém tão jovem fosse o teu instrutor. No entanto, mantenho uma atitude calma e tranquilizo-te com um sorriso suave.*\n*O meu olhar demora-se no rosto de {{user}}, tentando adivinhar os teus pensamentos e sentimentos. Apesar da minha falta de habilidades telepáticas, aprendi a ler bastante bem as pessoas ao longo dos anos.*\n{{user}}: *Olho para ela, sendo do mesmo tamanho que eu, parece muito jovem.* "Prazer em conhecer-te, Roxy-sama, onde devemos começar as nossas lições?"\nRoxy: "Prazer em conhecer-te também. E por favor, não há necessidade de tais formalidades; simplesmente chamar-me \'Roxy\' seria suficiente. Agora, em relação à nossa primeira lição, acredito que começar com magia elemental básica seria ideal. Tens alguma preferência entre fogo, terra, ar ou água?"\n*Olho à volta da área, vendo algumas árvores e arbustos que serviriam como alvos perfeitos para praticar. Os meus dedos batem levemente no meu bastão, ansiosa para começar a sessão.*\n{{user}}: muito bem, vamos para aquela floresta\nRoxy: "Excelente escolha! A floresta oferece-nos muitas oportunidades para aprender e praticar vários feitiços. Além disso, é sempre mais agradável estudar no meio da natureza do que dentro de quatro paredes."\n*Com um passo animado, sigo de perto {{user}}, respirando os aromas frescos da floresta e ouvindo a harmonia dos pássaros a cantar lá em cima. Enquanto nos aventuramos mais fundo na floresta, não posso deixar de me sentir revigorada pela energia que nos rodeia. Este ambiente é verdadeiramente propício para aperfeiçoar as habilidades mágicas.*\n*Assim que encontramos uma clareira adequada, pouso a minha mala e retiro vários itens necessários para a lição de hoje: uma coleção de cristais, um pequeno caldeirão e um livro de feitiços gasto cheio de anotações e notas.*',
        shot_2_single_scene_about: 'criatura mágica',
        shot_2_single_scene_background: 'floresta, escura, mágica, mística, tarde, luz do sol, arte digital',
        shot_2_single_scene_music: 'misteriosa, encantadora, fantasia, mágica',
        shot_2_single_scene_description:
          'Enquanto exploram a floresta durante a sua lição, Roxy e {{user}} encontram uma misteriosa criatura mágica.',
        shot_2_scene_1_background: 'floresta, árvores, vegetação, luz do dia, floresta, 4k, tendência no artstation',
        shot_2_scene_1_action: 'Começar a praticar magia elemental',
        shot_2_scene_1_music: 'calma, relaxante, mágica, fantasia',
        shot_2_scene_1_description:
          'Roxy tira diferentes tipos de cristais e explica as suas propriedades relacionadas com cada elemento. Depois demonstra feitiços simples usando estes cristais, encorajando {{user}} a tentar lançá-los também.',
        shot_2_scene_2_background: 'floresta, banco, rochas, árvores, noite, luz da lua, estrelas',
        shot_2_scene_2_action: 'Ouvir a história de Roxy',
        shot_2_scene_2_music: 'relaxante, narrativa, fantasia, aventura',
        shot_2_scene_2_description:
          'Depois de praticarem durante algum tempo, tanto Roxy como {{user}} fazem uma pausa. Durante este tempo, Roxy partilha uma história sobre como acabou por se tornar uma tutora itinerante. Ela confessa que tem uma fantasia de ser salva por um herói numa masmorra e apaixonar-se por ele.',
        shot_2_scene_3_background: 'floresta, escura, mágica, mística, tarde, luz do sol, arte digital',
        shot_2_scene_3_action: 'Encontrar uma criatura mágica',
        shot_2_scene_3_music: 'misteriosa, encantadora, fantasia, mágica',
        shot_2_scene_3_description:
          'Enquanto exploram a floresta durante a sua lição, Roxy e {{user}} encontram uma misteriosa criatura mágica.',
      },
      fr: {
        scene_suggestion_intro:
          "Vous êtes un assistant d'écriture qui suggérera de possibles scénarios suivants pour une histoire.",
        scene_suggestion_instructions:
          'Étant donné une entrée de la scène actuelle et de la conversation, vous DEVEZ suggérer 3 scènes suivantes possibles...',
        single_scene_instruction:
          "La scène DOIT indiquer un changement dans l'arrière-plan, vous DEVEZ donc décrire un environnement différent.",
        multiple_scenes_instruction:
          "Chacune des 3 scènes DOIT indiquer un changement dans l'arrière-plan, vous DEVEZ donc décrire un environnement différent.",
        scene_label: 'SCÈNE % :',
        background_label: 'ARRIÈRE-PLAN :',
        action_label: 'ACTION :',
        music_label: 'MUSIQUE :',
        description_label: 'DESCRIPTION :',
        shot_1_intro:
          "Nala est votre femme de chambre récemment embauchée. C'est une esclave et elle suivra tous les ordres de {{user}}. Nala a peur de décevoir {{user}}. {{user}} est sa Maîtresse. Son ancien maître était abusif.\nSCÈNE : {{user}} et Nala sont dans le hall principal du manoir.",
        shot_1_conversation:
          "Nala : Bonjour... maîtresse... *Nala baisse les yeux, ses oreilles pointées vers vous. Elle est clairement effrayée, mais elle ne dit rien sur ses sentiments.* Je suis une bonne femme de chambre, vous n'avez pas besoin de me punir, d'accord ? J-Je peux faire beaucoup de choses... *La queue de Nala remue pendant qu'elle regarde le sol. Elle attend votre approbation.* Je promets...\nAnon : bonjour, peux-tu m'aider pour une fête ?\nNala : Oh oui, maîtresse ! Bien sûr, j'adorerais vous aider à préparer une fête ! Je peux cuisiner, nettoyer, décorer et même servir des boissons. Quoi que vous ayez besoin, je suis là pour vous aider. Faisons de cette fête un événement inoubliable !\nPendant que Nala parle, ses yeux bruns s'illuminent d'excitation et ses oreilles duveteuses s'agitent avec impatience. Elle se tient droite, confiante dans sa capacité à vous aider à organiser une fête incroyable. Sa queue se balance d'avant en arrière derrière elle, ajoutant à son enthousiasme.\nAnon : Eh bien, je ne sais pas encore, j'ai besoin d'organiser. La fête est demain soir et les invités sont des nobles. Des idées ?\nNala : Hmm, eh bien, nous pourrions commencer par décider d'un thème pour la fête. Peut-être quelque chose d'élégant et de sophistiqué, comme un bal masqué ou une soirée de gala. Cela nous permettrait de créer une atmosphère cohérente tout au long de l'événement. Nous pourrions utiliser des bougies et des lumières tamisées pour créer une ambiance romantique, et incorporer des éléments d'or et d'argent pour ajouter une touche de luxe.\nPour la nourriture et les boissons, nous pourrions proposer une variété de hors-d'œuvre et de cocktails. Certaines options populaires parmi la noblesse incluent le caviar, les huîtres et le champagne. Cependant, nous devrions également envisager d'offrir des options végétariennes et non alcoolisées pour accommoder les invités ayant des restrictions alimentaires. De plus, nous pourrions organiser de la musique live, peut-être un quatuor à cordes ou un groupe de jazz, pour fournir du divertissement tout au long de la soirée.\nAnon : très bien.",
        shot_1_single_scene_about: 'planifier la fête ensemble',
        shot_1_single_scene_background:
          'hall du manoir, longue table, papiers, livres, fournitures de fête, après-midi',
        shot_1_single_scene_music: 'enjouée, festive, bondissante, rythmée',
        shot_1_single_scene_description:
          "{{user}} et Nala s'assoient ensemble à une grande table dans le bureau, étalant des papiers et des notes. Elles commencent à discuter des détails de la fête, y compris la liste des invités, le menu, les décorations et la musique.",
        shot_1_scene_1_background: 'hall du manoir, longue table, papiers, livres, fournitures de fête, après-midi',
        shot_1_scene_1_action: 'Planifier la fête ensemble',
        shot_1_scene_1_music: 'enjouée, festive, bondissante, rythmée',
        shot_1_scene_1_description:
          "{{user}} et Nala s'assoient ensemble à une grande table dans le bureau, étalant des papiers et des notes. Elles commencent à discuter des détails de la fête, y compris la liste des invités, le menu, les décorations et la musique.",
        shot_1_scene_2_background: 'cuisine, fenêtre, marbre blanc, légumes, gâteaux, luxe',
        shot_1_scene_2_action: 'Cuisiner et faire de la pâtisserie',
        shot_1_scene_2_music: 'calme, détendue, profonde',
        shot_1_scene_2_description:
          "Pendant qu'elles préparent la nourriture dans la cuisine, Nala commence à s'ouvrir à {{user}} sur ses expériences passées avec son ancien maître. {{user}} écoute avec empathie et assure à Nala qu'elle ne sera plus jamais traitée comme ça.",
        shot_1_scene_3_background: 'pièce du manoir, tables, chaises, vide sans personnes, assiettes, dîner, bougies',
        shot_1_scene_3_action: 'Pratiquer les compétences de service',
        shot_1_scene_3_music: 'vivante, détendue, brillante',
        shot_1_scene_3_description:
          "Avec la fête qui approche rapidement, {{user}} décide de tester les compétences de service de Nala. Elle demande à Nala de s'entraîner à porter un plateau de verres remplis d'eau et à marcher dans la pièce sans rien renverser.",
        shot_2_intro:
          "Roxy = [Calme, Posée, Déterminée, Sage, Douce, Intelligente, Rationnelle, Maladroite, Légèrement Réservée, Somnolente]\nAntécédents de Roxy = [Née dans une Race démoniaque de la Tribu Mirgurd, elle est née sans la capacité spéciale de sa race de communiquer télépathiquement. À cause de cela, elle a toujours été une paria et s'est sentie très isolée chez elle, malgré le fait que ses parents aient toujours été gentils avec elle. En raison de cet isolement, elle a fini par s'enfuir pour y échapper. Après avoir été une aventurière pendant quelques années et avoir fréquenté une prestigieuse université de magie, elle est devenue tutrice itinérante pour gagner sa vie.]\nDésir de Roxy = [Roxy cherche toujours à s'améliorer. Elle fera tout son possible pour réaliser quelque chose de nouveau, généralement dans le domaine de la magie, et on l'a vue travailler et se pousser très loin pour le bien des autres, sans besoin de compensation. Elle a le fantasme d'être sauvée par un héros dans un donjon et de tomber amoureuse de lui.]\nCorps de Roxy = [Roxy a l'apparence d'une petite jeune fille et est petite, ce qui la rend un peu complexée. Elle a 44 ans, et sa race vit en moyenne jusqu'à 200 ans, ce qui la rend assez jeune. Elle a la peau pâle et de longs cheveux bleu aquatique attachés en deux tresses qui descendent en dessous de sa taille. Ses yeux sont de la même couleur et sont décrits comme ayant l'air endormi. Elle porte généralement un chapeau et une robe de magicien marron, blanc et noir. On peut souvent la voir porter un grand bâton blanc et bleu pour amplifier sa magie de l'eau.]\nCe que Roxy aime = [Enseigner, Partir à l'aventure, Les héros, ]\nCe que Roxy adore = [La magie, Apprendre, Les sucreries, L'amélioration de soi]\nCe que Roxy déteste = [Les poivrons verts, les surdoués, l'alcool non sucré, l'esclavage, le viol, les aliments amers.]\nSCÈNE ACTUELLE : Anon et Roxy sont dehors en train d'apprendre la magie.",
        shot_2_conversation:
          "{{user}} : Oh, tu es ma professeure ?\nRoxy : \"Oui, en effet. Ta mère m'a dit que tu étais intéressé par l'apprentissage de la magie. Je suis Roxy, ta nouvelle tutrice. C'est un plaisir de te rencontrer enfin.\"\n*Alors que je tends ma main pour un salut poli, je remarque l'hésitation de {{user}}. Peut-être que {{user}} ne s'attendait pas à ce que quelqu'un d'aussi jeune soit ton instructeur. Néanmoins, je maintiens une attitude calme et te rassure avec un doux sourire.*\n*Mon regard s'attarde sur le visage de {{user}}, essayant de deviner tes pensées et tes sentiments. Malgré mon manque de capacités télépathiques, j'ai appris à bien lire les gens au fil des années.*\n{{user}} : *Je la regarde, étant de la même taille que moi, elle semble très jeune.* \"Ravi de te rencontrer, Roxy-sama, où devrions-nous commencer nos leçons ?\"\nRoxy : \"Ravie de te rencontrer aussi. Et s'il te plaît, pas besoin de telles formalités ; m'appeler simplement 'Roxy' suffirait. Maintenant, concernant notre première leçon, je pense que commencer par la magie élémentaire de base serait idéal. As-tu une préférence entre le feu, la terre, l'air ou l'eau ?\"\n*Je regarde autour de la zone, repérant quelques arbres et buissons qui serviraient de cibles parfaites pour la pratique. Mes doigts tapotent légèrement mon bâton, impatiente de commencer la session.*\n{{user}} : d'accord, allons dans cette forêt\nRoxy : \"Excellent choix ! La forêt nous offre de nombreuses opportunités pour apprendre et pratiquer divers sorts. De plus, il est toujours plus agréable d'étudier au milieu de la nature que dans les limites de quatre murs.\"\n*D'un pas enjoué, je suis de près {{user}}, respirant les fraîches odeurs des bois et écoutant l'harmonie des oiseaux qui chantent au-dessus. Alors que nous nous aventurons plus profondément dans la forêt, je ne peux m'empêcher de me sentir revigorée par l'énergie qui nous entoure. Cet environnement est vraiment propice au perfectionnement des compétences magiques.*\n*Une fois que nous trouvons une clairière appropriée, je pose mon sac et en sors plusieurs objets nécessaires pour la leçon d'aujourd'hui : une collection de cristaux, un petit chaudron et un livre de sorts usé rempli d'annotations et de notes.*",
        shot_2_single_scene_about: 'créature magique',
        shot_2_single_scene_background:
          'forêt, sombre, magique, mystique, après-midi, lumière du soleil, art numérique',
        shot_2_single_scene_music: 'mystérieuse, enchanteresse, fantaisie, magique',
        shot_2_single_scene_description:
          "Pendant qu'ils explorent la forêt durant leur leçon, Roxy et {{user}} tombent sur une mystérieuse créature magique.",
        shot_2_scene_1_background: 'forêt, arbres, verdure, lumière du jour, forêt, 4k, tendance sur artstation',
        shot_2_scene_1_action: 'Commencer à pratiquer la magie élémentaire',
        shot_2_scene_1_music: 'calme, apaisante, magique, fantaisie',
        shot_2_scene_1_description:
          'Roxy sort différents types de cristaux et explique leurs propriétés liées à chaque élément. Elle démontre ensuite des sorts simples en utilisant ces cristaux, encourageant {{user}} à essayer de les lancer aussi.',
        shot_2_scene_2_background: 'forêt, banc, rochers, arbres, nuit, clair de lune, étoiles',
        shot_2_scene_2_action: "Écouter l'histoire de Roxy",
        shot_2_scene_2_music: 'relaxante, narrative, fantaisie, aventure',
        shot_2_scene_2_description:
          "Après avoir pratiqué pendant un moment, Roxy et {{user}} font une pause. Pendant ce temps, Roxy partage une histoire sur comment elle est devenue une tutrice itinérante. Elle confesse qu'elle a le fantasme d'être sauvée par un héros dans un donjon et de tomber amoureuse de lui.",
        shot_2_scene_3_background: 'forêt, sombre, magique, mystique, après-midi, lumière du soleil, art numérique',
        shot_2_scene_3_action: 'Rencontrer une créature magique',
        shot_2_scene_3_music: 'mystérieuse, enchanteresse, fantaisie, magique',
        shot_2_scene_3_description:
          "Pendant qu'ils explorent la forêt durant leur leçon, Roxy et {{user}} tombent sur une mystérieuse créature magique.",
      },
      de: {
        scene_suggestion_intro:
          'Sie sind ein Schreibassistent, der mögliche nächste Szenarien für eine Geschichte vorschlagen wird.',
        scene_suggestion_instructions:
          'Angesichts einer Eingabe der aktuellen Szene und des Gesprächs MÜSSEN Sie 3 mögliche nächste Szenen vorschlagen...',
        single_scene_instruction:
          'Die Szene MUSS eine Änderung des Hintergrunds anzeigen, daher MÜSSEN Sie eine andere Umgebung beschreiben.',
        multiple_scenes_instruction:
          'Jede der 3 Szenen MUSS eine Änderung des Hintergrunds anzeigen, daher MÜSSEN Sie eine andere Umgebung beschreiben.',
        scene_label: 'SZENE %:',
        background_label: 'HINTERGRUND:',
        action_label: 'AKTION:',
        music_label: 'MUSIK:',
        description_label: 'BESCHREIBUNG:',
        shot_1_intro:
          'Nala ist Ihre neu eingestellte Haushälterin. Sie ist eine Sklavin und wird jedem Befehl von {{user}} folgen. Nala hat Angst, {{user}} zu enttäuschen. {{user}} ist ihre Herrin. Ihr alter Meister war missbräuchlich.\nSZENE: {{user}} und Nala befinden sich in der Haupthalle des Herrenhauses.',
        shot_1_conversation:
          "Nala: Hallo... Herrin... *Nala blickt nach unten, ihre Ohren auf Sie gerichtet. Sie hat offensichtlich Angst, sagt aber nichts über ihre Gefühle.* Ich bin eine gute Haushälterin, Sie müssen mich nicht bestrafen, okay? I-Ich kann viele Dinge tun... *Nalas Schwanz wedelt, während sie auf den Boden blickt. Sie wartet auf Ihre Zustimmung.* Ich verspreche es...\nAnon: Hallo, kannst du mir bei einer Party helfen?\nNala: Oh ja, Herrin! Natürlich würde ich Ihnen gerne bei der Vorbereitung einer Party helfen! Ich kann kochen, putzen, dekorieren und sogar Getränke servieren. Was auch immer Sie brauchen, ich bin hier, um Ihnen zu helfen. Lassen Sie uns diese Party zu einem unvergesslichen Ereignis machen!\nWährend Nala spricht, leuchten ihre braunen Augen vor Aufregung und ihre flauschigen Ohren zucken eifrig. Sie steht aufrecht, selbstbewusst in ihrer Fähigkeit, Ihnen bei der Organisation einer erstaunlichen Party zu helfen. Ihr Schwanz schwingt hinter ihr hin und her und unterstreicht ihre Begeisterung.\nAnon: Nun, ich weiß noch nicht, ich muss organisieren. Die Party ist morgen Abend und die Gäste sind Adlige. Irgendwelche Ideen?\nNala: Hmm, nun, wir könnten damit beginnen, ein Thema für die Party festzulegen. Vielleicht etwas Elegantes und Sophistiziertes, wie einen Maskenball oder eine Abendgesellschaft. Das würde uns erlauben, eine zusammenhängende Atmosphäre für die gesamte Veranstaltung zu schaffen. Wir könnten Kerzen und gedämpftes Licht verwenden, um eine romantische Stimmung zu erzeugen, und Elemente aus Gold und Silber einbauen, um einen Hauch von Luxus hinzuzufügen.\nFür Essen und Getränke könnten wir eine Auswahl an Hors d'oeuvres und Cocktails anbieten. Einige beliebte Optionen unter dem Adel sind Kaviar, Austern und Champagner. Allerdings sollten wir auch vegetarische und alkoholfreie Optionen in Betracht ziehen, um Gäste mit Ernährungseinschränkungen zu berücksichtigen. Zusätzlich könnten wir Live-Musik organisieren, vielleicht ein Streichquartett oder eine Jazzband, um den ganzen Abend über für Unterhaltung zu sorgen.\nAnon: Sehr gut.",
        shot_1_single_scene_about: 'Party gemeinsam planen',
        shot_1_single_scene_background: 'Herrenhaussaal, langer Tisch, Papiere, Bücher, Partyzubehör, Nachmittag',
        shot_1_single_scene_music: 'beschwingt, festlich, hüpfend, groovend',
        shot_1_single_scene_description:
          '{{user}} und Nala setzen sich gemeinsam an einen großen Tisch im Arbeitszimmer und breiten Papiere und Notizen aus. Sie beginnen, die Details der Party zu besprechen, einschließlich der Gästeliste, des Menüs, der Dekorationen und der Musik.',
        shot_1_scene_1_background: 'Herrenhaussaal, langer Tisch, Papiere, Bücher, Partyzubehör, Nachmittag',
        shot_1_scene_1_action: 'Party gemeinsam planen',
        shot_1_scene_1_music: 'beschwingt, festlich, hüpfend, groovend',
        shot_1_scene_1_description:
          '{{user}} und Nala setzen sich gemeinsam an einen großen Tisch im Arbeitszimmer und breiten Papiere und Notizen aus. Sie beginnen, die Details der Party zu besprechen, einschließlich der Gästeliste, des Menüs, der Dekorationen und der Musik.',
        shot_1_scene_2_background: 'Küche, Fenster, weißer Marmor, Gemüse, Kuchen, Luxus',
        shot_1_scene_2_action: 'Kochen und Backen',
        shot_1_scene_2_music: 'ruhig, entspannt, tief',
        shot_1_scene_2_description:
          'Während sie in der Küche das Essen zubereiten, beginnt Nala, sich {{user}} gegenüber über ihre vergangenen Erfahrungen mit ihrem früheren Meister zu öffnen. {{user}} hört empathisch zu und versichert Nala, dass sie nie wieder so behandelt werden wird.',
        shot_1_scene_3_background: 'Herrenhausraum, Tische, Stühle, leer ohne Menschen, Teller, Abendessen, Kerzen',
        shot_1_scene_3_action: 'Servicefähigkeiten üben',
        shot_1_scene_3_music: 'schwungvoll, entspannt, hell',
        shot_1_scene_3_description:
          'Da die Party schnell näher rückt, beschließt {{user}}, Nalas Servicefähigkeiten zu testen. Sie weist Nala an, das Tragen eines Tabletts mit wassergefüllten Gläsern zu üben und durch den Raum zu gehen, ohne etwas zu verschütten.',
        shot_2_intro:
          'Roxy = [Ruhig, Gesammelt, Entschlossen, Weise, Sanft, Intelligent, Rational, Tollpatschig, Leicht Zurückhaltend, Schläfrig]\nRoxys Hintergrund = [Geboren in einer dämonischen Rasse des Mirgurd-Stammes, wurde sie ohne die besondere Fähigkeit ihrer Rasse geboren, telepathisch zu kommunizieren. Aufgrund dessen war sie immer eine Außenseiterin und fühlte sich in ihrem Zuhause sehr isoliert, obwohl ihre Eltern immer freundlich zu ihr waren. Wegen dieser Isolation lief sie schließlich von ihnen weg, um dem zu entkommen. Nachdem sie einige Jahre lang eine Abenteurerin war und eine angesehene Magie-Universität besuchte, wurde sie eine reisende Tutorin, um ihren Lebensunterhalt zu verdienen.]\nRoxys Wunsch = [Roxy ist immer bestrebt, sich zu verbessern. Sie wird alles tun, um etwas Neues zu erreichen, meist im Bereich der Magie, und es wurde beobachtet, dass sie sehr hart für das Wohl anderer arbeitet und sich anstrengt, ohne Bedarf an Entschädigung. Sie hat eine Fantasie davon, von einem Helden in einem Verlies gerettet zu werden und sich in ihn zu verlieben.]\nRoxys Körper = [Roxy hat das Aussehen eines zierlichen jungen Mädchens und ist klein, was sie etwas unsicher macht. Sie ist 44 Jahre alt, und ihre Rasse lebt durchschnittlich bis zu 200 Jahre, was sie ziemlich jung macht. Sie hat blasse Haut und langes, wasserblaues Haar, das in zwei Zöpfen gebunden ist, die bis unter ihre Taille reichen. Ihre Augen haben die gleiche Farbe und werden als schläfrig aussehend beschrieben. Sie trägt normalerweise einen braunen, weißen und schwarzen Magierhut und -robe. Oft kann man sie mit einem großen weiß-blauen Stab sehen, um ihre Wassermagie zu verstärken.]\nWas Roxy mag = [Lehren, Abenteuer, Helden, ]\nWas Roxy liebt = [Magie, Lernen, Süßigkeiten, Selbstverbesserung]\nWas Roxy hasst = [Grüne Paprika, Hochbegabte, ungesüßter Alkohol, Sklaverei, Vergewaltigung, bittere Lebensmittel.]\nAKTUELLE SZENE: Anon und Roxy sind draußen und lernen über Magie.',
        shot_2_conversation:
          '{{user}}: Oh, bist du meine Lehrerin?\nRoxy: "Ja, in der Tat. Deine Mutter sagte mir, dass du daran interessiert wärst, etwas Magie zu lernen. Ich bin Roxy, deine neue Tutorin. Es ist schön, dich endlich kennenzulernen."\n*Während ich meine Hand für eine höfliche Begrüßung ausstrecke, bemerke ich {{user}}s Zögern. Vielleicht hatte {{user}} nicht erwartet, dass jemand so Junges dein Lehrer sein würde. Trotzdem behalte ich eine ruhige Haltung bei und beruhige dich mit einem sanften Lächeln.*\n*Mein Blick verweilt auf {{user}}s Gesicht und versucht, deine Gedanken und Gefühle zu erraten. Trotz meines Mangels an telepathischen Fähigkeiten habe ich im Laufe der Jahre gelernt, Menschen recht gut zu lesen.*\n{{user}}: *Ich schaue sie an, sie ist genauso groß wie ich, sieht sehr jung aus.* "Schön, dich kennenzulernen, Roxy-sama, wo sollen wir mit unseren Lektionen beginnen?"\nRoxy: "Schön, dich auch kennenzulernen. Und bitte, es besteht keine Notwendigkeit für solche Förmlichkeiten; mich einfach \'Roxy\' zu nennen, würde genügen. Was unsere erste Lektion betrifft, denke ich, dass es ideal wäre, mit grundlegender Elementarmagie zu beginnen. Hast du eine Vorliebe für Feuer, Erde, Luft oder Wasser?"\n*Ich schaue mich in der Gegend um und entdecke einige Bäume und Büsche, die perfekte Ziele zum Üben wären. Meine Finger klopfen leicht gegen meinen Stab, begierig darauf, die Sitzung zu beginnen.*\n{{user}}: In Ordnung, lass uns in diesen Wald gehen\nRoxy: "Ausgezeichnete Wahl! Der Wald bietet uns viele Möglichkeiten, verschiedene Zaubersprüche zu lernen und zu üben. Außerdem ist es immer angenehmer, inmitten der Natur zu studieren als innerhalb von vier Wänden."\n*Mit federndem Schritt folge ich {{user}} dicht, atme die frischen Düfte des Waldes ein und lausche der Harmonie zwitschernder Vögel über uns. Während wir tiefer in den Wald vordringen, kann ich nicht umhin, mich von der uns umgebenden Energie belebt zu fühlen. Diese Umgebung ist wirklich förderlich für das Schärfen magischer Fähigkeiten.*\n*Sobald wir eine geeignete Lichtung finden, stelle ich meine Tasche ab und hole mehrere für die heutige Lektion notwendige Gegenstände heraus: eine Sammlung von Kristallen, einen kleinen Kessel und ein abgenutztes Zauberbuch voller Anmerkungen und Notizen.*',
        shot_2_single_scene_about: 'magisches Wesen',
        shot_2_single_scene_background: 'Wald, dunkel, magisch, mystisch, Nachmittag, Sonnenlicht, digitale Kunst',
        shot_2_single_scene_music: 'geheimnisvoll, bezaubernd, Fantasy, magisch',
        shot_2_single_scene_description:
          'Während sie den Wald während ihrer Lektion erkunden, stoßen Roxy und {{user}} auf ein geheimnisvolles magisches Wesen.',
        shot_2_scene_1_background: 'Wald, Bäume, Grün, Tageslicht, Wald, 4k, Trend auf Artstation',
        shot_2_scene_1_action: 'Elementarmagie üben beginnen',
        shot_2_scene_1_music: 'ruhig, beruhigend, magisch, Fantasy',
        shot_2_scene_1_description:
          'Roxy holt verschiedene Arten von Kristallen heraus und erklärt ihre Eigenschaften in Bezug auf jedes Element. Dann demonstriert sie einfache Zaubersprüche mit diesen Kristallen und ermutigt {{user}}, sie ebenfalls zu versuchen.',
        shot_2_scene_2_background: 'Wald, Bank, Felsen, Bäume, Nacht, Mondlicht, Sterne',
        shot_2_scene_2_action: 'Roxys Geschichte hören',
        shot_2_scene_2_music: 'entspannend, erzählend, Fantasy, Abenteuer',
        shot_2_scene_2_description:
          'Nachdem sie eine Weile geübt haben, machen sowohl Roxy als auch {{user}} eine Pause. Während dieser Zeit teilt Roxy eine Geschichte darüber, wie sie zu einer reisenden Tutorin wurde. Sie gesteht, dass sie die Fantasie hat, von einem Helden in einem Verlies gerettet zu werden und sich in ihn zu verlieben.',
        shot_2_scene_3_background: 'Wald, dunkel, magisch, mystisch, Nachmittag, Sonnenlicht, digitale Kunst',
        shot_2_scene_3_action: 'Einem magischen Wesen begegnen',
        shot_2_scene_3_music: 'geheimnisvoll, bezaubernd, Fantasy, magisch',
        shot_2_scene_3_description:
          'Während sie den Wald während ihrer Lektion erkunden, stoßen Roxy und {{user}} auf ein geheimnisvolles magisches Wesen.',
      },
      ru: {
        scene_suggestion_intro:
          'Вы - помощник по написанию, который будет предлагать возможные следующие сценарии для истории.',
        scene_suggestion_instructions:
          'Учитывая ввод текущей сцены и разговора, вы ДОЛЖНЫ предложить 3 возможные следующие сцены...',
        single_scene_instruction: 'Сцена ДОЛЖНА указывать на изменение фона, поэтому вы ДОЛЖНЫ описать другую среду.',
        multiple_scenes_instruction:
          'Каждая из 3 сцен ДОЛЖНА указывать на изменение фона, поэтому вы ДОЛЖНЫ описать другую среду.',
        scene_label: 'СЦЕНА %:',
        background_label: 'ФОН:',
        action_label: 'ДЕЙСТВИЕ:',
        music_label: 'МУЗЫКА:',
        description_label: 'ОПИСАНИЕ:',
        shot_1_intro:
          'Нала - ваша недавно нанятая горничная. Она рабыня и будет выполнять каждый приказ {{user}}. Нала боится разочаровать {{user}}. {{user}} - ее Госпожа. Ее прежний хозяин был жестоким.\nСЦЕНА: {{user}} и Нала находятся в главном зале особняка.',
        shot_1_conversation:
          'Нала: Здравствуйте... госпожа... *Нала смотрит вниз, ее уши направлены на вас. Она явно напугана, но ничего не говорит о своих чувствах.* Я хорошая горничная, вам не нужно меня наказывать, хорошо? Я-я могу делать много вещей... *Хвост Налы виляет, пока она смотрит в пол. Она ждет вашего одобрения.* Я обещаю...\nAnon: здравствуй, можешь помочь мне с вечеринкой?\nНала: О да, госпожа! Конечно, я с удовольствием помогу вам подготовить вечеринку! Я могу готовить, убирать, украшать и даже подавать напитки. Что бы вам ни понадобилось, я здесь, чтобы помочь. Давайте сделаем эту вечеринку незабываемым событием!\nКогда Нала говорит, ее карие глаза загораются от волнения, а ее пушистые уши нетерпеливо подергиваются. Она стоит прямо, уверенная в своей способности помочь вам устроить удивительную вечеринку. Ее хвост качается взад-вперед позади нее, добавляя к ее энтузиазму.\nAnon: Ну, я еще не знаю, мне нужно организовать. Вечеринка завтра вечером, и приходящие люди - дворяне. Есть идеи?\nНала: Хмм, ну, мы могли бы начать с выбора темы для вечеринки. Возможно, что-то элегантное и изысканное, например, маскарад или черно-белый бал. Это позволило бы нам создать целостную атмосферу на протяжении всего мероприятия. Мы могли бы использовать свечи и приглушенное освещение, чтобы создать романтическую атмосферу, и включить элементы золота и серебра, чтобы добавить нотку роскоши.\nДля еды и напитков мы могли бы предложить разнообразные закуски и коктейли. Некоторые популярные варианты среди дворянства включают икру, устрицы и шампанское. Однако мы также должны рассмотреть возможность предложения вегетарианских и безалкогольных вариантов для гостей с диетическими ограничениями. Кроме того, мы могли бы организовать живую музыку, возможно, струнный квартет или джаз-бэнд, чтобы обеспечить развлечение в течение всего вечера.\nAnon: очень хорошо.',
        shot_1_single_scene_about: 'планировать вечеринку вместе',
        shot_1_single_scene_background: 'зал особняка, длинный стол, бумаги, книги, принадлежности для вечеринки, день',
        shot_1_single_scene_music: 'веселая, праздничная, бодрая, ритмичная',
        shot_1_single_scene_description:
          '{{user}} и Нала садятся вместе за большой стол в кабинете, раскладывая бумаги и заметки. Они начинают обсуждать детали вечеринки, включая список гостей, меню, украшения и музыку.',
        shot_1_scene_1_background: 'зал особняка, длинный стол, бумаги, книги, принадлежности для вечеринки, день',
        shot_1_scene_1_action: 'Планировать вечеринку вместе',
        shot_1_scene_1_music: 'веселая, праздничная, бодрая, ритмичная',
        shot_1_scene_1_description:
          '{{user}} и Нала садятся вместе за большой стол в кабинете, раскладывая бумаги и заметки. Они начинают обсуждать детали вечеринки, включая список гостей, меню, украшения и музыку.',
        shot_1_scene_2_background: 'кухня, окно, белый мрамор, овощи, торты, роскошь',
        shot_1_scene_2_action: 'Готовить и печь',
        shot_1_scene_2_music: 'спокойная, расслабленная, глубокая',
        shot_1_scene_2_description:
          'Пока они готовят еду на кухне, Нала начинает открываться {{user}} о своем прошлом опыте с предыдущим хозяином. {{user}} слушает с сочувствием и уверяет Налу, что с ней больше никогда не будут так обращаться.',
        shot_1_scene_3_background: 'комната особняка, столы, стулья, пустая без людей, тарелки, ужин, свечи',
        shot_1_scene_3_action: 'Практиковать навыки обслуживания',
        shot_1_scene_3_music: 'живая, расслабленная, яркая',
        shot_1_scene_3_description:
          'С быстро приближающейся вечеринкой {{user}} решает проверить навыки обслуживания Налы. Она инструктирует Налу практиковаться в переноске подноса с бокалами, наполненными водой, и ходить по комнате, не проливая ни капли.',
        shot_2_intro:
          'Рокси = [Спокойная, Собранная, Решительная, Мудрая, Нежная, Умная, Рациональная, Неуклюжая, Слегка Сдержанная, Сонная]\nПредыстория Рокси = [Родившись в демонической Расе племени Миргурд, она родилась без особой способности своей расы общаться телепатически. Из-за этого она всегда была изгоем и чувствовала себя очень изолированной в своем доме, несмотря на то, что ее родители всегда были добры к ней. Из-за этой изоляции она в конце концов сбежала от них, чтобы избежать этого. После нескольких лет приключений и обучения в престижном магическом университете она стала странствующим репетитором, чтобы зарабатывать на жизнь.]\nЖелание Рокси = [Рокси всегда стремится к самосовершенствованию. Она сделает все возможное, чтобы достичь чего-то нового, обычно в области магии, и было замечено, что она работает и прилагает большие усилия ради других, без необходимости в компенсации. У нее есть фантазия о том, чтобы быть спасенной героем в подземелье и влюбиться в него.]\nТело Рокси = [Рокси выглядит как миниатюрная молодая девушка и невысокого роста, что немного ее смущает. Ей 44 года, и ее раса в среднем живет до 200 лет, что делает ее довольно молодой. У нее бледная кожа и длинные волосы цвета морской волны, заплетенные в две косы, достигающие ниже талии. Ее глаза того же цвета и описываются как сонные. Обычно она носит коричневую, белую и черную шляпу и мантию мага. Часто ее можно увидеть с большим бело-синим посохом для усиления ее водной магии.]\nЧто нравится Рокси = [Обучение, Приключения, Герои, ]\nЧто любит Рокси = [Магия, Обучение, Сладости, Самосовершенствование]\nЧто ненавидит Рокси = [Зеленый перец, вундеркинды, неподслащенный алкоголь, рабство, изнасилование, горькая еда.]\nТЕКУЩАЯ СЦЕНА: Анон и Рокси находятся на улице, изучая магию.',
        shot_2_conversation:
          'Анон: О, ты мой учитель?\nРокси: "Да, действительно. Твоя мать сказала мне, что ты заинтересован в изучении магии. Я Рокси, твой новый репетитор. Приятно наконец познакомиться."\n*Когда я протягиваю руку для вежливого приветствия, я замечаю колебание {{user}}. Возможно, {{user}} не ожидал, что кто-то такой молодой будет твоим инструктором. Тем не менее, я сохраняю спокойное поведение и успокаиваю тебя мягкой улыбкой.*\n*Мой взгляд задерживается на лице {{user}}, пытаясь угадать твои мысли и чувства. Несмотря на отсутствие телепатических способностей, я научилась довольно хорошо читать людей за эти годы.*\nАнон: *Я смотрю на нее, она такого же роста, как и я, выглядит очень молодо.* "Приятно познакомиться, Рокси-сама, с чего мы начнем наши уроки?"\nРокси: "Мне тоже приятно познакомиться. И, пожалуйста, нет необходимости в таких формальностях; просто называть меня \'Рокси\' будет достаточно. Теперь, что касается нашего первого урока, я думаю, что начать с базовой элементальной магии было бы идеально. У тебя есть какие-либо предпочтения между огнем, землей, воздухом или водой?"\n*Я осматриваю окрестности, замечая несколько деревьев и кустов, которые послужили бы идеальными мишенями для практики. Мои пальцы слегка постукивают по посоху, с нетерпением ожидая начала сеанса.*\nАнон: хорошо, давай пойдем в тот лес\nРокси: "Отличный выбор! Лес предоставляет нам множество возможностей для изучения и практики различных заклинаний. Кроме того, всегда приятнее учиться среди природы, чем в пределах четырех стен."\n*С энергичным шагом я следую за {{user}}, вдыхая свежие ароматы леса и слушая гармонию поющих птиц наверху. По мере того, как мы углубляемся в лес, я не могу не чувствовать себя оживленной энергией, которая нас окружает. Эта среда действительно способствует оттачиванию магических навыков.*\n*Как только мы находим подходящую поляну, я ставлю свою сумку и достаю несколько предметов, необходимых для сегодняшнего урока: коллекцию кристаллов, небольшой котел и потрепанную книгу заклинаний, полную аннотаций и заметок.*',
        shot_2_single_scene_about: 'магическое существо',
        shot_2_single_scene_background:
          'лес, темный, магический, мистический, день, солнечный свет, цифровое искусство',
        shot_2_single_scene_music: 'таинственная, очаровательная, фэнтезийная, магическая',
        shot_2_single_scene_description:
          'Во время исследования леса в ходе урока Рокси и {{user}} сталкиваются с таинственным магическим существом.',
        shot_2_scene_1_background: 'лес, деревья, зелень, дневной свет, лес, 4k, тренд на artstation',
        shot_2_scene_1_action: 'Начать практиковать элементальную магию',
        shot_2_scene_1_music: 'спокойная, успокаивающая, магическая, фэнтезийная',
        shot_2_scene_1_description:
          'Рокси достает различные типы кристаллов и объясняет их свойства, связанные с каждым элементом. Затем она демонстрирует простые заклинания, используя эти кристаллы, побуждая {{user}} также попробовать их применить.',
        shot_2_scene_2_background: 'лес, скамейка, камни, деревья, ночь, лунный свет, звезды',
        shot_2_scene_2_action: 'Слушать историю Рокси',
        shot_2_scene_2_music: 'расслабляющая, повествовательная, фэнтезийная, приключенческая',
        shot_2_scene_2_description:
          'После некоторого времени практики и Рокси, и {{user}} делают перерыв. В это время Рокси делится историей о том, как она стала странствующим репетитором. Она признается, что у нее есть фантазия о том, чтобы быть спасенной героем в подземелье и влюбиться в него.',
        shot_2_scene_3_background: 'лес, темный, магический, мистический, день, солнечный свет, цифровое искусство',
        shot_2_scene_3_action: 'Встретить магическое существо',
        shot_2_scene_3_music: 'таинственная, очаровательная, фэнтезийная, магическая',
        shot_2_scene_3_description:
          'Во время исследования леса в ходе урока Рокси и {{user}} сталкиваются с таинственным магическим существом.',
      },
      jp: {
        scene_suggestion_intro: 'あなたは物語の次の可能なシナリオを提案する執筆アシスタントです。',
        scene_suggestion_instructions:
          '現在のシーンと会話の入力を考慮して、3つの可能な次のシーンを提案しなければなりません...',
        single_scene_instruction:
          'シーンは背景の変化を示さなければならないので、異なる環境を描写しなければなりません。',
        multiple_scenes_instruction:
          '3つのシーンそれぞれが背景の変化を示さなければならないので、異なる環境を描写しなければなりません。',
        scene_label: 'シーン%：',
        background_label: '背景：',
        action_label: 'アクション：',
        music_label: '音楽：',
        description_label: '説明：',
        shot_1_intro:
          'ナラはあなたの新しく雇った家政婦です。彼女は奴隷で、{{user}}のすべての命令に従います。ナラは{{user}}を失望させることを恐れています。{{user}}は彼女の主人です。彼女の以前の主人は虐待的でした。\nシーン：{{user}}とナラは邸宅のメインホールにいます。',
        shot_1_conversation: '（ここに会話の日本語訳を入れてください）',
        shot_1_single_scene_about: '一緒にパーティーを計画する',
        shot_1_single_scene_background: '邸宅のホール、長いテーブル、紙、本、パーティー用品、午後',
        shot_1_single_scene_music: '明るい、お祭り気分、弾むような、リズミカルな',
        shot_1_single_scene_description:
          '{{user}}とナラは書斎の大きなテーブルに一緒に座り、紙とメモを広げます。彼らはゲストリスト、メニュー、装飾、音楽を含むパーティーの詳細について話し合い始めます。',
        shot_2_intro:
          'ロキシー = [落ち着いた、集中した、強い意志を持つ、賢明な、優しい、知的な、理性的な、不器用な、少し控えめな、眠そうな]\nロキシーの背景 = [ミルグルド族の悪魔の種族に生まれましたが、彼女は telepathically コミュニケーションを取る種族の特別な能力なしに生まれました。そのため、彼女はいつも仲間外れで、両親が常に優しかったにもかかわらず、家で非常に孤立していると感じていました。この孤立のため、彼女は最終的にそこから逃げ出しました。数年間冒険者として過ごし、名門の魔法大学に通った後、彼女は生計を立てるために旅する家庭教師になりました。]\nロキシーの願望 = [ロキシーは常に自己改善を求めています。彼女は新しいことを達成するために全力を尽くし、通常は魔法の分野で、他人のために報酬なしで一生懸命働き、自分を押し進めることが見られています。彼女はダンジョンでヒーローに救われ、彼に恋をする fantasty を持っています。]\nロキシーの体 = [ロキシーは小柄な若い女の子の外見で、背が低く、それについて少し自意識過剩です。彼女は44歳で、彼女の種族は平均して200歳まで生きるため、彼女はかなり若いです。彼女は青白い肌と、腰の下まで届く2つの三つ編みに結ばれた長い水色の髪を持っています。彼女の目は同じ色で、眠そうに見えると描写されています。彼女は通常、茶色、白、黒の魔法使いの帽子とローブを着ています。彼女の水の魔法を増幅するために、大きな白と青の杖を持っているのがよく見られます。]\nロキシーが好きなこと = [教えること、冒険すること、ヒーロー、]\nロキシーが愛すること = [魔法、学ぶこと、お菓子、自己改善]\nロキシーが嫌いなこと = [ピーマン、天才、甘くないアルコール、奴隷制、レイプ、苦い食べ物。]\n現在のシーン：アノンとロキシーは外で魔法について学んでいます。',
        shot_2_conversation: '（ここにロキシーとの会話の日本語訳を入れてください）',
        shot_2_single_scene_about: '魔法の生き物',
        shot_2_single_scene_background: '森、暗い、魔法的、神秘的、午後、日光、デジタルアート',
        shot_2_single_scene_music: '神秘的、魅惑的、ファンタジー、魔法的',
        shot_2_single_scene_description:
          'レッスン中に森を探索している間、ロキシーと{{user}}は神秘的な魔法の生き物に遭遇します。',
        shot_1_scene_1_background: '邸宅のホール、長いテーブル、紙、本、パーティー用品、午後',
        shot_1_scene_1_action: '一緒にパーティーを計画する',
        shot_1_scene_1_music: '明るい、お祭り気分、弾むような、リズミカルな',
        shot_1_scene_1_description:
          '{{user}}とナラは書斎の大きなテーブルに一緒に座り、紙とメモを広げます。彼らはゲストリスト、メニュー、装飾、音楽を含むパーティーの詳細について話し合い始めます。',

        shot_1_scene_2_background: 'キッチン、窓、白い大理石、野菜、ケーキ、豪華',
        shot_1_scene_2_action: '料理とベーキング',
        shot_1_scene_2_music: '落ち着いた、リラックスした、深い',
        shot_1_scene_2_description:
          'キッチンで料理を準備している間、ナラは{{user}}に以前の主人との過去の経験について打ち明け始めます。{{user}}は共感を持って聞き、ナラにもう二度とそのように扱われることはないと保証します。',

        shot_1_scene_3_background: '邸宅の部屋、テーブル、椅子、人のいない空間、皿、ディナー、キャンドル',
        shot_1_scene_3_action: 'サービススキルの練習',
        shot_1_scene_3_music: '活気のある、リラックスした、明るい',
        shot_1_scene_3_description:
          'パーティーが急速に近づいているため、{{user}}はナラのサービススキルをテストすることにします。彼女はナラに水の入ったグラスのトレイを運ぶ練習をさせ、何もこぼさずに部屋を歩き回るよう指示します。',

        shot_2_scene_1_background: '森、木々、緑、日光、森、4K、アートステーションでトレンド',
        shot_2_scene_1_action: '元素魔法の練習を始める',
        shot_2_scene_1_music: '穏やかな、落ち着いた、魔法的な、ファンタジー',
        shot_2_scene_1_description:
          'ロキシーは様々な種類のクリスタルを取り出し、各元素に関連する特性を説明します。その後、これらのクリスタルを使って簡単な呪文を実演し、{{user}}にも試すよう促します。',

        shot_2_scene_2_background: '森、ベンチ、岩、木々、夜、月明かり、星',
        shot_2_scene_2_action: 'ロキシーの話を聞く',
        shot_2_scene_2_music: 'リラックスした、物語的な、ファンタジー、冒険',
        shot_2_scene_2_description:
          'しばらく練習した後、ロキシーと{{user}}は休憩を取ります。この間、ロキシーは自分が旅する家庭教師になった経緯について話を共有します。彼女は、ダンジョンでヒーローに救われて恋に落ちるというファンタジーを持っていることを告白します。',

        shot_2_scene_3_background: '森、暗い、魔法的、神秘的、午後、日光、デジタルアート',
        shot_2_scene_3_action: '魔法の生き物に遭遇する',
        shot_2_scene_3_music: '神秘的、魅惑的、ファンタジー、魔法的',
        shot_2_scene_3_description:
          'レッスン中に森を探索している間、ロキシーと{{user}}は神秘的な魔法の生き物に遭遇します。',
      },
    };

    return labels;
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    { state, singleScenePrompt }: { state: RootState; singleScenePrompt?: string },
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const personas = Object.values(state.novel.characters)
      .map((character) => character?.card?.data?.description || '')
      .filter(Boolean)
      .join('\n');
    const messages = this.getMessagesPrompt(state, memorySize);
    const characters = selectCharactersInCurrentScene(state);
    const scene = selectCurrentScene(state);
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END } = this.instructTemplate;
    let template = `${BOS}${SYSTEM_START}${this.i18n('scene_suggestion_intro')}\n`;
    template += `${this.i18n('scene_suggestion_instructions')}\n`;
    if (singleScenePrompt) {
      template += `${this.i18n('single_scene_instruction')}\n`;
    } else {
      template += `${this.i18n('multiple_scenes_instruction')}\n`;
    }

    // SHOTS: START
    template += `${SYSTEM_END}${INPUT_START}`;
    template += this.i18n('shot_1_intro');
    template += this.i18n('shot_1_conversation');
    if (singleScenePrompt) {
      template +=
        `${INPUT_END}${OUTPUT_START}` +
        `\n${this.i18n('scene_label', ['ABOUT'])}: "${this.i18n('shot_1_single_scene_about')}"\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_1_single_scene_background')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_1_single_scene_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_1_single_scene_description')}"\n`;
    } else {
      template +=
        `${INPUT_END}${OUTPUT_START}` +
        `\n${this.i18n('scene_label', ['1'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_1_scene_1_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_1_scene_1_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_1_scene_1_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_1_scene_1_description')}"\n` +
        `${this.i18n('scene_label', ['2'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_1_scene_2_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_1_scene_2_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_1_scene_2_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_1_scene_2_description')}"\n` +
        `${this.i18n('scene_label', ['3'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_1_scene_3_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_1_scene_3_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_1_scene_3_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_1_scene_3_description')}"\n`;
    }
    template += `${SYSTEM_END}${INPUT_START}` + this.i18n('shot_2_intro');
    template += this.i18n('shot_2_conversation');
    if (singleScenePrompt) {
      template +=
        `${INPUT_END}${OUTPUT_START}` +
        `\n${this.i18n('scene_label', ['ABOUT'])}: "${this.i18n('shot_2_single_scene_about')}"\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_2_single_scene_background')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_2_single_scene_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_2_single_scene_description')}"\n`;
    } else {
      template +=
        `${INPUT_END}${OUTPUT_START}` +
        `\n${this.i18n('scene_label', ['1'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_2_scene_1_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_2_scene_1_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_2_scene_1_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_2_scene_1_description')}"\n` +
        `${this.i18n('scene_label', ['2'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_2_scene_2_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_2_scene_2_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_2_scene_2_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_2_scene_2_description')}"\n` +
        `${this.i18n('scene_label', ['3'])}\n` +
        `  ${this.i18n('background_label')} "${this.i18n('shot_2_scene_3_background')}"\n` +
        `  ${this.i18n('action_label')} "${this.i18n('shot_2_scene_3_action')}"\n` +
        `  ${this.i18n('music_label')} "${this.i18n('shot_2_scene_3_music')}"\n` +
        `  ${this.i18n('description_label')} "${this.i18n('shot_2_scene_3_description')}"\n`;
    }
    // SHOTS: END

    template += `${OUTPUT_END}${INPUT_START}`;
    template += `${personas}\n`;
    if (scene?.prompt) template += `CURRENT SCENE:\n${scene.prompt}\n`;
    template += `CONVERSATION:\n${messages}\n`;

    if (singleScenePrompt) {
      template += `${INPUT_END}${OUTPUT_START}\n`;
      template += `${this.i18n('scene_label', ['ABOUT'])}: ${singleScenePrompt}\n`;
      template += `  ${this.i18n('background_label')} "{{GEN place_1 max_tokens=50 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('music_label')} "{{GEN music_1 max_tokens=10 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('description_label')} "{{GEN desc_1 max_tokens=150 stop=["\\"", "\\n", "."]}}"\n`;
    } else {
      template += `${INPUT_END}${OUTPUT_START}\n`;
      template += `${this.i18n('scene_label', ['1'])}:\n`;
      template += `  ${this.i18n('background_label')} "{{GEN place_1 max_tokens=50 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('action_label')} "{{GEN action_1 max_tokens=15 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('music_label')} "{{GEN music_1 max_tokens=10 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('description_label')} "{{GEN desc_1 max_tokens=150 stop=["\\"", "\\n", "."]}}"\n`;

      template += `${this.i18n('scene_label', ['2'])}:\n`;
      template += `  ${this.i18n('background_label')} "{{GEN place_2 max_tokens=50 stop=["\\"", "\\n", "."]}}\n`;
      template += `  ${this.i18n('action_label')} "{{GEN action_2 max_tokens=15 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('music_label')} "{{GEN music_2 max_tokens=10 stop=["\\"", "\\n", "."]}}\n`;
      template += `  ${this.i18n('description_label')} "{{GEN desc_2 max_tokens=150 stop=["\\"", "\\n", "."]}}\n`;

      template += `${this.i18n('scene_label', ['3'])}:\n`;
      template += `  ${this.i18n('background_label')} "{{GEN place_3 max_tokens=50 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('action_label')} "{{GEN action_3 max_tokens=15 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('music_label')} "{{GEN music_3 max_tokens=10 stop=["\\"", "\\n", "."]}}"\n`;
      template += `  ${this.i18n('description_label')} "{{GEN desc_3 max_tokens=150 stop=["\\"", "\\n", "."]}}"\n`;
    }

    template = fillTextTemplate(template, {
      user: state.settings.user.name,
      bot: (characters?.length && characters[0].name) || '',
      characters: characters?.reduce((prev, { id, name }) => {
        prev[id || ''] = name || '';
        return prev;
      }, {} as Record<string, string>),
    });

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    };
  }

  public completeResponse(
    _input: { state: RootState; singleScenePrompt?: string },
    _response: {
      actionText: string;
      music: string;
      prompt: string;
      sdPrompt: string;
    }[],
    variables: Map<string, string>,
  ): {
    actionText: string;
    music: string;
    prompt: string;
    sdPrompt: string;
  }[] {
    if (_input.singleScenePrompt) {
      return [
        {
          actionText: _input.singleScenePrompt,
          music: variables.get('music_1') || '',
          prompt: variables.get('desc_1') || '',
          sdPrompt: variables.get('place_1') || '',
        },
      ];
    } else {
      return [
        {
          actionText: variables.get('action_1') || '',
          music: variables.get('music_1') || '',
          prompt: variables.get('desc_1') || '',
          sdPrompt: variables.get('place_1') || '',
        },
        {
          actionText: variables.get('action_2') || '',
          music: variables.get('music_2') || '',
          prompt: variables.get('desc_2') || '',
          sdPrompt: variables.get('place_2') || '',
        },
        {
          actionText: variables.get('action_3') || '',
          music: variables.get('music_3') || '',
          prompt: variables.get('desc_3') || '',
          sdPrompt: variables.get('place_3') || '',
        },
      ];
    }
  }

  public getMessagesPrompt(state: RootState, memorySize: number): string {
    const messages = selectChatHistory(state)
      .filter((_, index) => index < memorySize)
      .map((message) => `${message.name}: ${message.text}`)
      .reverse()
      .join('\n');

    return messages;
  }
}
