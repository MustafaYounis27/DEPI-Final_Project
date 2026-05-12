using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace ClinicManagmentAPIs.Model

{
    [Table("UserAccount")]
    public class UserAccount

    {
        [Key]
        [Column("user_id")]
      public int user_id { get; set; }
             
      public string? username { get; set; }=string.Empty;
     
      public string? password_hash { get; set; } = string.Empty;

      public string? role { get; set; } = string.Empty;

      public int? doctor_id_FK { get; set; }

      public string? email {  get; set; }=string.Empty;

      public bool active_flag { get; set; }

      public DateTime created_at { get; set; }


    }
}
