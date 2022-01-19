const answers = require('./answers.json');
const guesses = require('./guesses.json');

const guessSet: Set<string> = new Set(guesses);
answers.forEach((answer: string) => guessSet.add(answer));

const MAX_GUESSES = 6;

export enum Result {
    Present,
    Correct,
    Absent,
}

export function isValidGuess(s: string): boolean
{
    return guessSet.has(s);
}

export function doGuess(guess: string, answer: string): Array<Result>
{
    if(!isValidGuess(guess))
    {
        throw new Error(`Invalid guess: ${guess}`);
    }
    if(!isValidGuess(answer))
    {
        throw new Error(`Invalid answer: ${answer}`);
    }

    const result: Array<Result> = new Array(guess.length);
    const letters: Array<string | undefined> = [...guess];
    const map: Map<string, number> = new Map();

    [...answer].forEach((letter: string, index: number) =>
    {
        if(letters[index] === letter)
        {
            result[index] = Result.Correct;
            letters[index] = undefined;
        }
        else
        {
            map.set(letter, 1 + (map.get(letter) || 0));
        }
    });

    letters.forEach((letter: string | undefined, index: number) =>
    {
        if(letter !== undefined)
        {
            const count = map.get(letter) || 0;
            if(count > 0)
            {
                map.set(letter, count - 1);
                result[index] = Result.Present;
                return;
            }
            else
            {
                result[index] = Result.Absent;
            }
        }
    });

    return result;
}


function dateToAnswerIndex(date: Date): number
{
    // reconstructed from https://www.powerlanguage.co.uk/wordle/main.c1506a22.js
    return Math.round((date.setHours(0,0,0,0) - new Date(2021,5,19,0,0,0,0).setHours(0,0,0,0))/864e5) % answers.length;
}

function printResults(results: Array<Result>): string
{
    return results.map(result =>
    {
        switch(result)
        {
            case Result.Correct:
                return '🟩';
            case Result.Present:
                return '🟨';
            case Result.Absent:
                return '⬛';
        }
    }).join('');
}

function allCorrect(results: Array<Result>): boolean
{
    return results.every((result: Result) => result === Result.Correct);
}

export class Wordle
{
    guesses: Array<{guess: string, results: Array<Result>}>
    private index: number;

    constructor(date?: Date)
    {
        this.guesses = [];
        this.index = dateToAnswerIndex(date || new Date());
    }

    guess(guess: string): string
    {
        if(this.guesses.length >= MAX_GUESSES)
        {
            throw new Error('Out of guesses');
        }
        if(this.guesses.length > 0 && allCorrect(this.guesses[this.guesses.length - 1].results))
        {
            throw new Error('Already guessed this word');
        }
        const results = doGuess(guess, answers[this.index]);
        this.guesses.push({guess, results})
        return printResults(results);
    }

    print(): string
    {
        const finished = this.guesses.length > 0 && allCorrect(this.guesses[this.guesses.length - 1].results);
        return (
            `Wordle ${this.index} ${this.guesses.length}/${MAX_GUESSES}\n\n` +
            this.guesses.map(({guess, results}) => `${finished ? '' : `${guess}: `}${printResults(results)}`).join('\n') +
            (finished ? `\n\n---\n${this.guesses.map(({guess}) => guess).join(',')}` : '')
        );
    }
}
