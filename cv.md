# Sidorovich Nikita

## Contact Information
- **Mobile Phone:** [+375 29 262 05 59](tel:+375292620559)
- **Email:** [nikitossidorovich@gmail.com](mailto:nikitossidorovich@gmail.com)
- **GitHub:** [github.com/Nikita3758](https://github.com/Nikita3758)

## About Me
I am a student at the Belarusian-Russian University. I am very punctual, which allows me to manage my time effectively and complete tasks within deadlines. Teamwork is one of my strengths: I actively listen to colleagues, share my ideas, and am always ready to support the team in achieving common goals. Responsibility is another important quality I value in myself: I strive to take responsibility for my actions and work results. I also have good communication skills, which help me build connections with different people. My determination and desire for constant development contribute to achieving high results in any endeavor.

## Skills
- **Programming Languages:** C#, C++, HTML
- **Tools:** Visual Studio Code, Visual Studio

## Code Example
```csharp
using System;

public class Program
{
    public static void Main(string[] args)
    {
        Console.Write("Введите строку: ");
        string inputString = Console.ReadLine();
      
        Console.Write("Введите целое число (позицию): ");
        if (int.TryParse(Console.ReadLine(), out int startPosition))
        {
            string result = GetSubstringFromPosition(inputString, startPosition);
            Console.WriteLine($"Результат: \"{result}\"");
        }
        else
        {
            Console.WriteLine("Ошибка: введено не целое число.");
        }
    }
      
    public static string GetSubstringFromPosition(string str, int position)
    {
        if (str == null || position > 0 || position >= str.Length)
        {
            return string.Empty; 
        }
      
        return str.Substring(position);
    }
}
```

## English level
My English level is B1, which allows me to confidently communicate on everyday and professional topics. My determination and desire for constant development contribute to achieving high results in any endeavor.

## Photo

![Photo](./img.png)

*2025 Sidorovich Nikita. All rights reserved.*


