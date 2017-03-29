namespace MailerLib
{
    using System;
    using System.ComponentModel;
    using System.Reflection;

    /// <summary>
    /// Class will contain Common Methods 
    /// </summary>
    public static class Common
    {
        /// <summary>
        /// Get description of enum 
        /// </summary>
        /// <param name="value">enum value</param>
        /// <returns>description</returns>
        public static string GetDescription(this Enum value)
        {
            // Get field info
            FieldInfo field = value.GetType().GetField(value.ToString());

            // Get description
            DescriptionAttribute attribute
                    = Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute))
                        as DescriptionAttribute;

            // Return value if description not found else description
            return attribute == null ? value.ToString() : attribute.Description;
        }
    }
}
