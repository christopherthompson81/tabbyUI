Completions are a moderately simpler task compared to multi-turn conversations. The idea is that a text is continued in the same pattern as that text, where the model predicts a highly likely follow-on. This is useful for taking a series of examples and expanding them to another case, or creating a non-canonical chapter in your favourite book.

To provide some understanding we will go through creating a non-canonical chapter for "Alice’s Adventures in Wonderland" by Lewis Carroll. We will take the book text, which includes twelve canonical chapters, and expand it by inserting a new, non-canonical, chapter between chapters seven and eight. This new chapter will be titled "CHAPTER VII and a Half. - The Curious Ladybug". A markdown file that has been formatted for this test has been provided here.

1. Create a new "Continuations" folder in the left-hand drawer.
2. Select that continuation, rename it to "AiW - Curious Ladybug".
3. In the textbox shown, click edit.
4. Paste the content of the test file here.
5. Load "Qwen2.5-32B" - not instruct, not coder, not anything, just base.
6. Indicate that you are looking for 3072 additional tokens to be generated. <test to make sure this is enough>
    * Additional parameters are temperature, XTC, top_k, etc. <expand, be precise and explain why for each choice>
7. Click "Continue".

Instruct tuned models will likely devolve into nonsense as they have been modified in a way so that the lack of multiturn behaviour is confusing for them. Base models work better for completion tasks